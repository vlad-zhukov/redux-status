# redux-status · [![npm](https://img.shields.io/npm/v/redux-status.svg)](https://npm.im/redux-status)

> A higher-order component decorator for painless state management with Redux and React.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
  - [`reduxStatus(options)`](#reduxstatusoptions)
  - [`reducer`](#reducer)
  - [`selectors`](#selectors)
  - [`actions`](#actions)
  - [`actionTypes`](#actiontypes)

## Install

```bash
$ yarn add redux-status
```

or

```bash
$ npm install --save redux-status
```

## Usage

__Step 1:__ Add the `redux-status` reducer to the Redux store:

```js
import {combineReducers, createStore} from 'redux';
import {reducer as statusReducer} from 'redux-status';

const reducers = combineReducers({
    // 'status' is the default key 'reduxStatus' uses, you can
    // use another key but then you will also need to define
    // the 'getStatusState' option when initializing 'reduxStatus'
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
    name: 'CounterExample', // 'name' is a required property
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

## Examples

Example apps can be found under the `examples/` directory. They are ported from the official [Redux repository](https://github.com/reactjs/redux/tree/master/examples), so you can compare both implementations.

- [Counter](https://github.com/Vlad-Zhukov/redux-status/tree/master/examples/counter)

## API

### `reduxStatus([options])`

__Arguments__

1. `[options]` _(Object)_: Arguments that will be merged with the default config. Setting `options` here is optional as React props can be used instead. Defaults to `{}`. Available properties:
    - `[name]` _(String)_: A key where the state will be stored under the `status` reducer. It's an optional property in `options`, but a required one in general. If it wasn't set here, it must be set with React props.
    - `[initialValues]` _(Object)_: Values which will be used during initialization, they can have any shape. Defaults to `{}`.
    - `[persist]` _(Boolean)_: If `false`, the state related to that `name` will be removed when the last component using it unmounts. Defaults to `true`.
    - `[getStatusState]` _(Function)_: A function that takes the entire Redux state and returns the state slice where the `redux-status` was mounted. Defaults to `state => state.status`.

__Returns__

A function, that accepts a React component, and returns a higher-order React component that is connected to the Redux store using the `connect` function from the [`react-redux`](https://github.com/reactjs/react-redux).

__Instance props__

The following props will be passed down to the wrapped component.

- `status` _(Object)_
- `setStatus(nextStatus)` _(Function)_: The `nextStatus` will be merged with the current `status`.
- `setStatusTo(statusName, nextStatus)` _(Function)_
- `initialize(config)` _(Function)_
- `destroy()` _(Function)_

These props are the ones that have been used during initialization. They are not connected to the store for performance reasons, but it might be changed in the future if there will be a strong reason to do that.

- `statusName` _(String)_
- `initialValues` _(Object)_
- `persist` _(Boolean)_
- `[getStatusState(state)]` _(Function)_

### `reducer`

A status reducer that should be mounted to the Redux store under the `status` key.

If you have to mount it to the key other than `status`, you may provide a `getStatusState()` function to the [`reduxStatus()`](#reduxstatusoptions) decorator.

__Usage__
```js
import {combineReducers, createStore} from 'redux';
import {reducer as statusReducer} from 'redux-status';

const reducers = combineReducers({
    status: statusReducer,
    // other reducers
});

const store = createStore(reducers);
```

### `selectors`

An object with Redux selectors.

#### `getStatusValue(statusName, [getStatusState])`

__Arguments__

1. `statusName` _(String)_: The name of the status you are connecting to. Must be the same as the `name` you gave to [`reduxStatus()`](#reduxstatusoptions).
2. `[getStatusState]` _(Function)_: A function that takes the entire Redux state and returns the state slice where the `redux-status` was mounted. Defaults to `state => state.status`.

#### `getStatusMeta(statusName, [getStatusState])`

__Arguments__

1. `statusName` _(String)_: The name of the status you are connecting to. Must be the same as the `name` you gave to [`reduxStatus()`](#reduxstatusoptions).
2. `[getStatusState]` _(Function)_: A function that takes the entire Redux state and returns the state slice where the `redux-status` was mounted. Defaults to `state => state.status`.

### `actions`

An object with all internal action creators. This is an advanced API and most of the time shouldn't be used directly. It is recommended that you use the actions passed down to the wrapped component, as they are already bound to `dispatch()` and `statusName`.

#### `initialize(statusName, config)`

__Arguments__

1. `statusName` _(String)_
2. `config` _(Object)_: initial config.

#### `destroy(statusName)`

__Arguments__

1. `statusName` _(String)_

#### `update(statusName, payload)`

__Arguments__

1. `statusName` _(String)_
2. `payload` _(Object)_

### `actionTypes`

An object with Redux action types.

- `INITIALIZE` _(String)_
- `DESTROY` _(String)_
- `UPDATE` _(String)_
- `prefix` _(String)_
