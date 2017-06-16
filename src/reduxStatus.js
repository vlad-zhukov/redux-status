import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import {getDisplayName} from './helpers';

export default function (options = {}) {
    const config = {
        name: undefined,
        initialValues: {},
        persist: true,
        getStatusState: undefined,
        statusRef: () => {},
        statusWrappedRef: () => {},
        ...options,
    };

    return (WrappedComponent) => {
        const connector = connect(
            (state, props) => {
                if (typeof props.name !== 'string') {
                    throw new TypeError(
                        "ReduxStatus: Argument 'name' is required and must be a 'string'," +
                            `but got: '${typeof props.name}'.`
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

            /* eslint-disable react/require-default-props */
            static propTypes = {
                name: PropTypes.string.isRequired,
                statusRef: PropTypes.func,
                statusWrappedRef: PropTypes.func,
                initialValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
                persist: PropTypes.bool,
                getStatusState: PropTypes.func,
                status: PropTypes.object, // eslint-disable-line react/forbid-prop-types
                initialize: PropTypes.func,
                destroy: PropTypes.func,
            };

            componentWillMount() {
                this.props.statusRef(this);
                this.props.initialize();
            }

            componentWillUnmount() {
                this.props.destroy();
            }

            render() {
                const {name, statusRef, statusWrappedRef, status, ...rest} = this.props;
                if (!status) return null;
                return <WrappedComponent {...rest} ref={statusWrappedRef} statusName={name} status={status} />;
            }
        }

        const ConnectedStatus = hoistStatics(connector(ReduxStatus), WrappedComponent);
        ConnectedStatus.defaultProps = config;

        return ConnectedStatus;
    };
}
