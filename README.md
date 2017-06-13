# redux-status · [![npm](https://img.shields.io/npm/v/redux-status.svg)](https://npm.im/redux-status)
> A higher-order component decorator for painless state management with Redux and React.

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [`reduxStatus(options)`](#reduxstatusoptions)
  - [`reducer`](#reducer)
  - [`selectors`](#selectors)
  - [`actionTypes`](#actiontypes)
  - [`actionCreators`](#actioncreators)

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
    // 'status' is the default name reduxStatus uses,
    // it can be overriden with the getStatusState option
    status: statusReducer,
    // other reducers
});

const store = createStore(reducers);
```

__Step 2:__ Connect components with the `reduxStatus` decorator:
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
__Arguments__
- `options` _(Object)_: Available properties:
  - `name` _(String)_: A key where the state will be stored under the `status` reducer.
  - `[initialValues]` _(Object)_: Values which will be used during initialization, they can have any shape. Defaults to `{}`.
  - `[persist]` _(Boolean)_: If `false`, the state related to that `name` will be removed when the last component using it unmounts. Defaults to `true`.
  - `[getStatusState]` _(Function)_: A function that takes the entire Redux state and returns the state slice where the `redux-status` was mounted. Defaults to `state => state.status`.

__Instance props__
- `status` _(Object)_
- `setStatus` _(Function)_
- `setStatusTo` _(Function)_
- `initialize` _(Function)_
- `destroy` _(Function)_
- `initialValues` _(Object)_
- `persist` _(Boolean)_
- `[getStatusState]` _(Function)_

### `reducer`

### `selectors`
- `selectors.getStatusValue(statusName, [getStatusState])`
- `selectors.getStatusMeta(statusName, [getStatusState])`

### `actionTypes`
- `actionTypes.INITIALIZE`
- `actionTypes.DESTROY`
- `actionTypes.UPDATE`
- `actionTypes._prefix`

### `actionCreators`
- `actionCreators.initialize(statusName, config)`
- `actionCreators.destroy(statusName)`
- `actionCreators.update(statusName, payload)`
