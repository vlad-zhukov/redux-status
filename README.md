# redux-status · [![npm](https://img.shields.io/npm/v/redux-status.svg)](https://www.npmjs.com/package/redux-status)
> A higher-order component decorator for painless UI state management in Redux and React.

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [`reduxStatus(options)`](#reduxstatusoptions)

## Install
```bash
$ yarn add redux-status
```
or
```bash
$ npm install --save redux-status
```

## Usage
__Step 1:__ Add the `redux-status` reducer:
```js
import {combineReducers, createStore} from 'redux';
import {reducer as statusReducer} from 'redux-status';

const reducers = combineReducers({
    status: statusReducer,
    // other reducers
});

const store = createStore(reducers);
```

__Step 2:__ Connect components with `reduxStatus` decorator:
```js
import React, {PureComponent} from 'react';
import {reduxStatus} from 'redux-status';

@reduxStatus({
    name: 'CounterExample',
    initialValues: {
        counter: 0,
    },
})
class Counter extends PureComponent {
    _onClickIncrease = () => {
        const {status, setStatus} = this.props;

        setStatus({counter: status.counter + 1});
    }

    _onClickDecrease = () => {
        const {status, setStatus} = this.props;

        setStatus({counter: status.counter - 1});
    }

    render() {
        const {status, setStatus} = this.props;

        return (
            <div>
                <p>{status.counter}</p>
                <button onClick={this._onClickIncrease}>Increase</button>
                <button onClick={this._onClickDecrease}>Decrease</button>
            </div>
        );
    }
}
```

## API

### `reduxStatus(options)`
