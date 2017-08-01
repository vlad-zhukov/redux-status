import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moize from 'moize';
import hoistStatics from 'hoist-non-react-statics';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import * as promiseState from './promiseState';
import {getDisplayName, type, extractAsyncValues} from './helpers';

export default function reduxStatus(options = {}) {
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

        function callPromise(props, key, asyncValue, isMounting, isForced) {
            // Do not recall rejected (uncached) promises unless forced
            if (
                isForced === false &&
                props.status !== undefined &&
                props.status[key] !== undefined &&
                props.status[key].rejected === true
            ) {
                return;
            }

            const moized = memoized[key];
            const args = type(asyncValue.args) === 'array' ? asyncValue.args : [];

            if (isForced === false && isMounting === false && moized !== undefined && moized.has(args) === true) {
                return;
            }

            if (moized !== undefined) {
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
                });
        }

        function callPromises(props, isMounting = false, isForced = false) {
            const asyncValues = extractAsyncValues(props);
            const asyncKeys = Object.keys(asyncValues);
            for (let i = 0, l = asyncKeys.length; i < l; i++) {
                const key = asyncKeys[i];
                const asyncValue = asyncValues[key];

                callPromise(props, key, asyncValue, isMounting, isForced);
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
                initialize: payload => dispatch(actionCreators.initialize(props.name, payload)),
                destroy: () => dispatch(actionCreators.destroy(props.name)),
                setStatus: payload => dispatch(actionCreators.update(props.name, payload)),
                setStatusTo: (name, payload) => dispatch(actionCreators.update(name, payload)),
                dispatch,
            })
        );

        class ReduxStatus extends Component {
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
                const fakeProps = {...this.props, status: this.props.initialValues};

                this.props.statusRef(this);
                this.props.initialize(fakeProps);
                callPromises(fakeProps, true);
            }

            componentWillReceiveProps(nextProps) {
                callPromises(nextProps);
            }

            shouldComponentUpdate(nextProps) {
                if (nextProps.status === undefined || nextProps.asyncValues === undefined) return true;

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
                if (status === undefined) return null;
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
            getStatusState: undefined,
            statusRef: () => {},
            wrappedRef: () => {},
            ...options,
        };

        return ConnectedStatus;
    };
}
