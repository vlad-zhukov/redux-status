import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {reduxStatus} from 'redux-status';

const connector = reduxStatus({
    name: 'Counter',
    initialValues: {
        value: 0,
    },
});

export class Counter extends PureComponent {
    static propTypes = {
        status: PropTypes.object.isRequired,
        setStatus: PropTypes.func.isRequired,
    };

    increment = () => {
        const {status, setStatus} = this.props;
        setStatus({value: status.value + 1});
    };

    decrement = () => {
        const {status, setStatus} = this.props;
        setStatus({value: status.value - 1});
    };

    incrementIfOdd = () => {
        if (this.props.status.value % 2 !== 0) {
            this.increment();
        }
    };

    incrementAsync = () => {
        setTimeout(() => this.increment(), 1000);
    };

    render() {
        const {status} = this.props;
        return (
            <p>
                Clicked: {status.value} times
                {' '}
                <button onClick={this.increment}>
                    +
                </button>
                {' '}
                <button onClick={this.decrement}>
                    -
                </button>
                {' '}
                <button onClick={this.incrementIfOdd}>
                    Increment if odd
                </button>
                {' '}
                <button onClick={this.incrementAsync}>
                    Increment async
                </button>
            </p>
        );
    }
}

export default connector(Counter);
