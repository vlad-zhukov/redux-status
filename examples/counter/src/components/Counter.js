import React, {PureComponent} from 'react';
import {reduxStatus, propTypes} from 'redux-status';

const connector = reduxStatus({
    name: 'Counter',
    initialValues: {
        value: 0,
    },
});

export class Counter extends PureComponent {
    static propTypes = propTypes.status;

    constructor(props, context) {
        super(props, context);

        this.increment = () => {
            this.props.setStatus(s => ({value: s.value + 1}));
        };

        this.decrement = () => {
            this.props.setStatus(s => ({value: s.value - 1}));
        };

        this.incrementIfOdd = () => {
            if (this.props.status.value % 2 !== 0) {
                this.increment();
            }
        };

        this.incrementAsync = () => {
            setTimeout(() => this.increment(), 1000);
        };
    }

    render() {
        return (
            <div>
                Clicked: {this.props.status.value} times <button onClick={this.increment}>+</button>{' '}
                <button onClick={this.decrement}>-</button>{' '}
                <button onClick={this.incrementIfOdd}>Increment if odd</button>{' '}
                <button onClick={this.incrementAsync}>Increment async</button>
            </div>
        );
    }
}

export default connector(Counter);
