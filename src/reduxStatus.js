import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moize from 'moize';
import hoistStatics from 'hoist-non-react-statics';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import * as promiseState from './promiseState';
import {getDisplayName, type, extractAsyncValues} from './helpers';

export default function (options = {}) {
    return (WrappedComponent) => {
        const memoized = {};

        function memoizeAsyncValue(key, value) {
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

            memoized[key] = moize(value.promise, {
                isPromise: true,
                maxAge: value.maxAge,
                maxArgs: value.maxArgs,
                maxSize: value.maxSize,
            });
        }

        function callPromises(props, isMounting = false, isForced = false) {
            const asyncValues = extractAsyncValues(props);
            const asyncKeys = Object.keys(asyncValues);
            for (let i = 0, l = asyncKeys.length; i < l; i++) {
                const key = asyncKeys[i];
                const asyncValue = asyncValues[key];
                const memo = memoized[key];
                const isMemoized = !!memo;
                const args = asyncValue.args || {};

                if (isForced || isMemoized === false || memo.hasCacheFor(...args) === false) {
                    if (isMemoized === true) {
                        props.setStatus(s => ({
                            [key]: promiseState.refreshing(s[key]),
                        }));
                    }
                    else {
                        memoizeAsyncValue(key, asyncValue);

                        if (isMounting === false) {
                            props.setStatus({
                                [key]: promiseState.pending(),
                            });
                        }
                    }

                    memoized
                        [key](...args) // eslint-disable-line no-unexpected-multiline
                        .then((result) => {
                            props.setStatus({
                                [key]: promiseState.fulfilled(result),
                            });
                        })
                        .catch((e) => {
                            props.setStatus({
                                [key]: promiseState.rejected(e.message),
                            });
                            throw e;
                        });
                }
            }
        }

        const connector = connect(
            (state, props) => {
                if (type(props.name) !== 'string') {
                    throw new TypeError(
                        "ReduxStatus: Argument 'name' is required and must be a 'string'," +
                            `but got: '${type(props.name)}'.`
                    );
                }

                return {
                    status: getStatusValue(props.name, props.getStatusState)(state),
                };
            },
            (dispatch, props) => ({
                initialize: () => dispatch(actionCreators.initialize(props.name, props)),
                destroy: () => dispatch(actionCreators.destroy(props.name)),
                setStatus: payload => dispatch(actionCreators.update(props.name, payload)),
                setStatusTo: (name, payload) => dispatch(actionCreators.update(name, payload)),
                dispatch,
            })
        );

        class ReduxStatus extends PureComponent {
            static displayName = `ReduxStatus(${getDisplayName(WrappedComponent)})`;

            /* eslint-disable react/require-default-props, react/forbid-prop-types */
            static propTypes = {
                name: PropTypes.string.isRequired,
                statusRef: PropTypes.func,
                wrappedRef: PropTypes.func,
                initialValues: PropTypes.object,
                asyncValues: PropTypes.func,
                persist: PropTypes.bool,
                getStatusState: PropTypes.func,
                status: PropTypes.object,
                initialize: PropTypes.func,
                destroy: PropTypes.func,
                setStatus: PropTypes.func,
                setStatusTo: PropTypes.func,
            };
            /* eslint-enable */

            componentWillMount() {
                this.props.statusRef(this);
                this.props.initialize();
                callPromises(this.props, true);
            }

            componentWillReceiveProps(nextProps) {
                callPromises(nextProps);
            }

            shouldComponentUpdate(nextProps) {
                if (!nextProps.status || nextProps.asyncKeys) return true;

                const asyncValues = extractAsyncValues(nextProps);
                const asyncKeys = Object.keys(asyncValues);
                if (asyncKeys.length === 0) return true;

                // If one of async values hasn't been added to the status yet, prevent the update
                for (let i = 0, l = asyncKeys.length; i < l; i++) {
                    if (nextProps.status[asyncKeys[i]] === undefined) {
                        return false;
                    }
                }

                return true;
            }

            componentWillUnmount() {
                this.props.destroy();
            }

            setStatus(payload) {
                this.props.setStatus(payload);
            }

            setStatusTo(name, payload) {
                this.props.setStatusTo(name, payload);
            }

            refresh = () => {
                callPromises(this.props, false, true);
            };

            get status() {
                return this.props.status;
            }

            render() {
                const {name, statusRef, wrappedRef, status, initialValues, asyncValues, ...rest} = this.props;
                if (!status) return null;
                return (
                    <WrappedComponent
                        {...rest}
                        ref={wrappedRef}
                        statusName={name}
                        status={status}
                        refresh={this.refresh}
                    />
                );
            }
        }

        const ConnectedStatus = hoistStatics(connector(ReduxStatus), WrappedComponent);
        ConnectedStatus.defaultProps = {
            name: undefined,
            initialValues: {},
            asyncValues: null,
            persist: true,
            getStatusState: undefined,
            statusRef: () => {},
            wrappedRef: () => {},
            ...options,
        };

        return ConnectedStatus;
    };
}
