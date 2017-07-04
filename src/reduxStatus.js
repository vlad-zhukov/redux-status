import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import {getDisplayName, type} from './helpers';

export default function (options = {}) {
    return (WrappedComponent) => {
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

            get status() {
                return this.props.status;
            }

            render() {
                const {name, statusRef, wrappedRef, status, ...rest} = this.props;
                if (!status) return null;
                return <WrappedComponent {...rest} ref={wrappedRef} statusName={name} status={status} />;
            }
        }

        const ConnectedStatus = hoistStatics(connector(ReduxStatus), WrappedComponent);
        ConnectedStatus.defaultProps = {
            name: undefined,
            initialValues: {},
            persist: true,
            getStatusState: undefined,
            statusRef: () => {},
            wrappedRef: () => {},
            ...options,
        };

        return ConnectedStatus;
    };
}
