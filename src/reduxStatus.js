import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moize from 'moize';
import hoistStatics from 'hoist-non-react-statics';
import {elementsEqual} from 'react-shallow-equal';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import * as promiseState from './promiseState';
import {getDisplayName, type, extractAsyncValues} from './helpers';

const memoized = {};

function memoizeAsyncValue(key, value, onExpire) {
    const typeOfValue = type(value);
    if (typeOfValue !== 'object') {
        throw new TypeError(
            `ReduxStatus: argument 'values' must return an object of objects, but got: '${typeOfValue}'.`
        );
    }

    const typeOfValuePromise = type(value.promise);
    if (typeOfValuePromise !== 'function') {
        throw new TypeError(
            "ReduxStatus: argument 'values' must return an object of objects with a property 'promise' " +
                `each, but got: '${typeOfValuePromise}'.`
        );
    }

    memoized[key] = moize(value.promise, {
        isPromise: true,
        maxAge: value.maxAge,
        maxArgs: value.maxArgs,
        maxSize: value.maxSize,
        onExpire,
    });
}

function callPromise({props, key, asyncValue, prevArgs, onExpire, isMounting, isForced}) {
    // Do not recall rejected (uncached) promises unless forced
    if (
        isForced === false &&
        props.status !== undefined &&
        props.status[key] !== undefined &&
        props.status[key].rejected === true
    ) {
        return;
    }

    const args = type(asyncValue.args) === 'array' ? asyncValue.args : [];

    if (memoized[key] !== undefined) {
        if (memoized[key].has(args) === true) {
            if (isMounting === false && elementsEqual(args, prevArgs)) {
                return;
            }
        }
        else {
            // Only set to refreshing when the result is not cached
            props.setStatus(s => ({
                [key]: promiseState.refreshing(s[key]),
            }));
        }
    }
    else {
        memoizeAsyncValue(key, asyncValue, onExpire);

        if (isMounting === false) {
            props.setStatus({
                [key]: promiseState.pending(),
            });
        }
    }

    memoized[key](...args)
        .then((result) => {
            props.setStatus({
                [key]: promiseState.fulfilled(result),
            });
        })
        .catch((e) => {
            props.setStatus({
                [key]: promiseState.rejected(e.message),
            });
        });
}

function callPromises({props, prevProps, onExpire, isMounting = false, isForced = false}) {
    // Stop auto-refreshing
    if (props.autoRefresh === false && isForced === false) {
        return;
    }

    const asyncValues = extractAsyncValues(props);
    const prevAsyncValues = prevProps && prevProps.status ? extractAsyncValues(prevProps) : null;
    const asyncKeys = Object.keys(asyncValues);
    for (let i = 0, l = asyncKeys.length; i < l; i++) {
        const key = asyncKeys[i];
        const asyncValue = asyncValues[key];

        const prevArgs =
            prevAsyncValues && type(prevAsyncValues[key].args) === 'array' ? prevAsyncValues[key].args : [];

        callPromise({props, key, asyncValue, prevArgs, onExpire, isMounting, isForced});
    }
}

export default function reduxStatus(options = {}) {
    return (WrappedComponent) => {
        const connector = connect(
            (state, props) => {
                const typeOfName = type(props.name);
                if (typeOfName !== 'string') {
                    throw new TypeError(
                        `ReduxStatus: Argument 'name' is required and must be a 'string', but got: '${typeOfName}'.`
                    );
                }

                return {
                    status: getStatusValue(props.name, props.getStatusState)(state),
                };
            },
            (dispatch, props) => ({
                initialize: payload => dispatch(actionCreators.initialize(props.name, payload)),
                destroy: () => dispatch(actionCreators.destroy(props.name)),
                setStatus: payload => dispatch(actionCreators.update(props.name, payload)),
                setStatusTo: (name, payload) => dispatch(actionCreators.update(name, payload)),
                dispatch,
            })
        );

        class ReduxStatus extends React.Component {
            static displayName = `ReduxStatus(${getDisplayName(WrappedComponent)})`;

            /* eslint-disable react/require-default-props, react/forbid-prop-types */
            static propTypes = {
                name: PropTypes.string.isRequired,
                statusRef: PropTypes.func,
                wrappedRef: PropTypes.func,
                initialValues: PropTypes.object,
                asyncValues: PropTypes.func,
                persist: PropTypes.bool,
                autoRefresh: PropTypes.bool,
                getStatusState: PropTypes.func,
                status: PropTypes.object,
                initialize: PropTypes.func,
                destroy: PropTypes.func,
                setStatus: PropTypes.func,
                setStatusTo: PropTypes.func,
            };
            /* eslint-enable */

            componentWillMount() {
                const fakeProps = {...this.props, status: this.props.initialValues};

                this.props.statusRef(this);
                this.props.initialize(fakeProps);
                callPromises({props: fakeProps, onExpire: () => this.forceUpdate(), isMounting: true});
            }

            shouldComponentUpdate(nextProps) {
                if (nextProps.status === undefined || nextProps.asyncValues === undefined) return true;

                const asyncValues = extractAsyncValues(nextProps);
                const asyncKeys = Object.keys(asyncValues);
                if (asyncKeys.length === 0) return true;

                if (nextProps.autoRefresh !== false) {
                    // If one of async values hasn't been added to the status yet, prevent the update
                    for (let i = 0, l = asyncKeys.length; i < l; i++) {
                        if (nextProps.status[asyncKeys[i]] === undefined) {
                            return false;
                        }
                    }
                }

                return true;
            }

            componentWillUpdate(nextProps) {
                callPromises({props: nextProps, prevProps: this.props, onExpire: () => this.forceUpdate()});
            }

            componentWillUnmount() {
                this.props.destroy();
            }

            get status() {
                return this.props.status;
            }

            setStatus(payload) {
                this.props.setStatus(payload);
            }

            setStatusTo(name, payload) {
                this.props.setStatusTo(name, payload);
            }

            refresh = () => {
                // Always forces an update
                callPromises({props: this.props, isForced: true});
            };

            render() {
                const {name, statusRef, wrappedRef, status, initialValues, asyncValues, ...rest} = this.props;

                if (status === undefined) {
                    return null;
                }

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
            asyncValues: undefined,
            persist: true,
            autoRefresh: true,
            getStatusState: undefined,
            statusRef: () => {},
            wrappedRef: () => {},
            ...options,
        };

        return ConnectedStatus;
    };
}
