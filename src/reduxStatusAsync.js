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

            /* eslint-disable react/require-default-props, react/forbid-prop-types */
            static propTypes = {
                name: PropTypes.string.isRequired,
                values: PropTypes.func.isRequired,
                initialValues: PropTypes.object,
            };
            /* eslint-enable */

            constructor(props, context) {
                super(props, context);

                this.valueKeys = null;
                this.memoized = {};
                this.initialValues = {...props.initialValues};

                const values = this._extractValues(props);

                this.valueKeys.forEach((key) => {
                    this._setupValue(key, values[key]);
                    this.initialValues[key] = promiseState.pending();
                });
            }

            componentDidMount() {
                this._callPromises(this.props);
            }

            componentWillUpdate(nextProps) {
                this._callPromises(nextProps);
            }

            componentWillUnmount() {
                this.valueKeys = undefined;
                this.memoized = undefined;
                this.initialValues = undefined;
            }

            setStatus(payload) {
                this.statusRef.setStatus(payload);
            }

            setStatusTo(name, payload) {
                this.statusRef.setStatusTo(name, payload);
            }

            refresh = () => {
                this._callPromises(this.props, true);
            };

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

            _setupValue(key, value) {
                if (type(value) !== 'object') {
                    throw new TypeError(
                        `ReduxStatus: argument 'values' must return an object of objects, but got: '${type(value)}'.`
                    );
                }

                if (type(value.promise) !== 'function') {
                    throw new TypeError(
                        "ReduxStatus: argument 'values' must return an object of objects with a property 'promise' " +
                            `each, but got: '${type(value.promise)}'.`
                    );
                }

                this.memoized[key] = moize(value.promise, {
                    isPromise: true,
                    maxAge: value.maxAge,
                    maxArgs: value.maxArgs,
                    maxSize: value.maxSize,
                });
            }

            _callPromises(props, force = false) {
                const values = this._extractValues(props);
                this.valueKeys.forEach((key) => {
                    const memoized = this.memoized[key];
                    const isMemoized = !!memoized;
                    const value = values[key];
                    const args = value.args || {};

                    if (force || !isMemoized || !memoized.hasCacheFor(...args)) {
                        if (isMemoized) {
                            this.setStatus(s => ({
                                [key]: promiseState.refreshing(s[key]),
                            }));
                        }
                        else {
                            this._setupValue(key, value);
                            this.setStatus({
                                [key]: promiseState.pending(),
                            });
                        }

                        this.memoized
                            [key](...args) // eslint-disable-line no-unexpected-multiline
                            .then((result) => {
                                this.setStatus({
                                    [key]: promiseState.fulfilled(result),
                                });
                            })
                            .catch((e) => {
                                this.setStatus({
                                    [key]: promiseState.rejected(e.message),
                                });
                                throw e;
                            });
                    }
                });
            }

            _getRef = (ref) => {
                this.statusRef = ref;
            };

            render() {
                const {values, initialValues, ...rest} = this.props;
                return (
                    <ReduxStatus
                        {...rest}
                        statusRef={this._getRef}
                        initialValues={this.initialValues}
                        refresh={this.refresh}
                    />
                );
            }
        }

        const HoistedStatusAsync = hoistStatics(ReduxStatusAsync, ReduxStatus);
        HoistedStatusAsync.defaultProps = {
            name: undefined,
            initialValues: {},
            values: () => ({}),
            ...options,
        };

        return HoistedStatusAsync;
    };
}
