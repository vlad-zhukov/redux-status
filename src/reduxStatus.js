import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from './actionCreators';
import {getStatusValue} from './selectors';
import {getDisplayName, assignDefined} from './helpers';

export default function (options) {
    if (typeof options.name !== 'string') {
        throw new TypeError(
            `redux-status: Parameter 'name' is required and must be a 'string', but got: '${typeof options.name}'.`
        );
    }

    let config = {
        initialValues: {},
        persist: true,
        getStatusState: undefined,
        ...options,
    };

    return (WrappedComponent) => {
        class ReduxStatus extends PureComponent {
            static propTypes = {
                status: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
                initialize: PropTypes.func.isRequired,
                destroy: PropTypes.func.isRequired,
                setStatus: PropTypes.func.isRequired,
                setStatusTo: PropTypes.func.isRequired,
            };

            static displayName = getDisplayName(WrappedComponent);

            componentWillMount() {
                config = assignDefined(config, this.props, ['initialValues', 'persist', 'getStatusState']);
                this.props.initialize();
            }

            componentWillUnmount() {
                this.props.destroy();
            }

            render() {
                const {status, ...rest} = this.props;
                if (!status) return null;
                return <WrappedComponent statusName={config.name} status={status} {...rest} />;
            }
        }

        const statusValueSelector = getStatusValue(config.name, config.getStatusState);

        return connect(
            state => ({
                status: statusValueSelector(state),
            }),
            dispatch =>
                bindActionCreators(
                    {
                        initialize: () => actionCreators.initialize(config.name, config),
                        destroy: () => actionCreators.destroy(config.name),
                        setStatus: payload => actionCreators.update(config.name, payload),
                        setStatusTo: (name, payload) => actionCreators.update(name, payload),
                    },
                    dispatch
                )
        )(ReduxStatus);
    };
}
