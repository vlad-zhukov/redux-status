import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import moize from 'moize';
import hoistStatics from 'hoist-non-react-statics';
import reduxStatus from './reduxStatus';
import * as promiseState from './promiseState';
import {getDisplayName, type} from './helpers';

export default function reduxStatusAsync(options = {}) {
    return (WrappedComponent) => {
        const ReduxStatus = reduxStatus()(WrappedComponent);

        class ReduxStatusAsync extends PureComponent {
            static displayName = `ReduxStatusAsync(${getDisplayName(ReduxStatus)})`;

            static propTypes = {
                name: PropTypes.string.isRequired,
                values: PropTypes.func.isRequired,
            };

            constructor(props, context) {
                super(props, context);

                this.valueKeys = null;
                this.memoized = {};
                this.initialValues = {};

                const values = this._extractValues(props);

                this.valueKeys.forEach((key) => {
                    this._initValue(key, values[key]);
                    this.initialValues[key] = promiseState.pending();
                });
            }

            componentDidMount() {
                this._callPromises(this.props);
            }

            componentWillUpdate(nextProps) {
                this._extractValues(nextProps);
                this._callPromises(nextProps);
            }

            componentWillUnmount() {
                this.valueKeys = undefined;
                this.memoized = undefined;
                this.initialValues = undefined;
            }

            _extractValues(props) {
                if (type(props.values) !== 'function') {
                    throw new TypeError(
                        `ReduxStatus: argument 'values' must be a function, but got: '${type(props.values)}'.`
                    );
                }

                const values = props.values(props);

                if (type(values) !== 'object') {
                    throw new TypeError(
                        `ReduxStatus: argument 'values' must return an object, but got: '${type(values)}'.`
                    );
                }

                this.valueKeys = Object.keys(values);

                return values;
            }

            _initValue(key, value) {
                if (type(value) !== 'object') {
                    throw new TypeError(
                        `ReduxStatus: argument 'values' must return an object of objects, but got: '${type(value)}'.`
                    );
                }

                if (type(value.promise) !== 'function') {
                    throw new TypeError(
                        "ReduxStatus: argument 'values' must return an object of objects with property 'promise' " +
                            `each, but got: '${type(value.promise)}'.`
                    );
                }

                this.memoized[key] = moize(value.promise, {
                    isPromise: true,
                    maxAge: value.maxAge,
                    maxArgs: value.maxArgs,
                    maxSize: value.maxSize || 5,
                });
            }

            _callPromises(props) {
                const values = this._extractValues(props);
                this.valueKeys.forEach((key) => {
                    const value = values[key];

                    if (this.memoized[key]) {
                        this.status.setStatus(s => ({
                            [key]: promiseState.refreshing(s[key]),
                        }));
                    }
                    else {
                        this._initValue(key, value);
                        this.status.setStatus({
                            [key]: promiseState.pending(),
                        });
                    }

                    this.memoized
                        [key](...(value.args || {})) // eslint-disable-line no-unexpected-multiline
                        .then((result) => {
                            this.status.setStatus({
                                [key]: promiseState.fulfilled(result),
                            });
                        })
                        .catch((e) => {
                            this.status.setStatus({
                                [key]: promiseState.rejected(e.message),
                            });
                        });
                });
            }

            _getRef = (ref) => {
                this.status = ref;
            };

            render() {
                const {values, ...rest} = this.props;
                return <ReduxStatus {...rest} statusRef={this._getRef} initialValues={this.initialValues} />;
            }
        }

        const HoistedStatus = hoistStatics(ReduxStatusAsync, ReduxStatus);
        HoistedStatus.defaultProps = {
            name: undefined,
            values: () => ({}),
            ...options,
        };

        return HoistedStatus;
    };
}
