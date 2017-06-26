# redux-status · [![npm](https://img.shields.io/npm/v/redux-status.svg)](https://npm.im/redux-status)

> Higher-order component decorators for painless state management with
Redux and React.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
  - [`reduxStatus(options)`](#reduxstatusoptions)
  - [`reduxStatusAsync(options)`](#reduxstatusasyncoptions)
  - [`reducer`](#reducer)
  - [`selectors`](#selectors)
  - [`actions`](#actions)
  - [`actionTypes`](#actiontypes)

## Install

```bash
yarn add redux-status
  # or
npm install --save redux-status
```

## Usage

__Step 1:__ Add the `redux-status` reducer to the Redux store:

```jsx
import {combineReducers, createStore} from 'redux';
import {reducer as statusReducer} from 'redux-status';

const reducers = combineReducers({
    // 'status' is the default key 'reduxStatus' uses; you can
    // use another key but then you will also need to define
    // the 'getStatusState' option when initializing 'reduxStatus'
    status: statusReducer,
    // other reducers
});

const store = createStore(reducers);
```

__Step 2:__ Connect components with the `reduxStatus` decorator:

```jsx
import React, {PureComponent} from 'react';
import {reduxStatus} from 'redux-status';

@reduxStatus({
    name: 'Counter', // 'name' is required
    initialValues: {
        counter: 0,
    },
})
class Counter extends PureComponent {
    increment = () => {
        this.props.setStatus(prevStatus => ({
            counter: prevStatus.counter + 1,
        }));
    }

    decrement = () => {
        this.props.setStatus(prevStatus => ({
            counter: prevStatus.counter - 1,
        }));
    }

    render() {
        return (
            <div>
                <p>{this.props.status.counter}</p>
                <button onClick={this.increment}>Increment</button>
                <button onClick={this.decrement}>Decrement</button>
            </div>
        );
    }
}
```

## Examples

Example apps can be found under the `examples/` directory. They are
ported from the official [Redux repository](https://github.com/reactjs/redux/tree/master/examples),
so you can compare both implementations.

- [Counter](https://github.com/Vlad-Zhukov/redux-status/tree/master/examples/counter)
- [Async](https://github.com/Vlad-Zhukov/redux-status/tree/master/examples/async)

## API

### `reduxStatus([options])`

A higher-order component decorator that is connected to the Redux store
using the `connect` function from the [`react-redux`](https://github.com/reactjs/react-redux).

__Arguments__

1. `[options]` _(Object)_: Arguments that will be used as `defaultProps`.
Setting `options` here is optional as React props can be used instead.
Defaults to `{}`. Available properties:
    - `[name]` _(String)_: A key where the state will be stored under
    the `status` reducer. It's an optional property in `options`,
    but a required one in general. If it wasn't set here, it must
    be set with React props.
    - `[initialValues]` _(Object)_: Values which will be used during
    initialization, they can have any shape. Defaults to `{}`.
    - `[persist]` _(Boolean)_: If `false`, the state related to that
    `name` will be removed when the last component using it unmounts.
    Defaults to `true`.
    - `[getStatusState]` _(Function)_: A function that takes the entire
    Redux state and returns the state slice where the `redux-status`
    was mounted. Defaults to `state => state.status`.

__Returns__

A function, that accepts a React component, and returns a higher-order
React component.

__Passed props__

The following props will be passed down to the wrapped component:

- `status` _(Object)_
- `setStatus(nextStatus)` _(Function)_: If the `nextStatus` is a
function, it takes a current status as an argument and must return an
object that will be shallow merged with the current `status`. If
the `nextStatus` is an object, it will be shallow merged directly.
- `setStatusTo(statusName, nextStatus)` _(Function)_: Similar
to `setStatus()` but also takes in a `statusName` as the first argument.
Recommended for setting data to another statuses.
- `initialize(config)` _(Function)_
- `destroy()` _(Function)_

These props are the ones that have been used during initialization.
They are not connected to the store for performance reasons, but it
might be changed in the future if there will be a strong reason
to do that.

- `statusName` _(String)_
- `initialValues` _(Object)_
- `persist` _(Boolean)_
- `[getStatusState(state)]` _(Function)_

__Instance methods__

The following methods are exposed as component instance methods so they
can be called from the outer component.

- `setStatus(nextStatus)`
- `setStatusTo(statusName, nextStatus)`

Based on the example above:
```jsx
const Counter = reduxStatus({
    name: 'Counter',
    initialValues: {
        counter: 0,
    },
})(({status}) => <p>{status.counter}</p>);

class CounterController extends PureComponent {
    increment = () => {
        this.counter.setStatus(prevStatus => ({
            counter: prevStatus.counter + 1,
        }));
    }

    decrement = () => {
        this.counter.setStatus(prevStatus => ({
            counter: prevStatus.counter - 1,
        }));
    }

    _getRef = (ref) => {
        this.counter = ref;
    }

    render() {
        return (
            <div>
                <Counter statusRef={this._getRef} />
                <button onClick={this.increment}>Increment</button>
                <button onClick={this.decrement}>Decrement</button>
            </div>
        );
    }
}
```

---

### `reduxStatusAsync([options])`

A higher-order component decorator for handling async jobs (such as data
fetching). It uses [`moize`](https://github.com/planttheidea/moize)
for caching requests and [`reduxStatus()`](#reduxstatusoptions)
for storing and updating the results.

__Arguments__

1. `[options]` _(Object)_: Arguments that will be used as `defaultProps`.
Setting `options` here is optional as React props can be used instead.
Defaults to `{}`. Available properties:
    - `[name]` _(String)_: A key where the state will be stored under
    the `status` reducer. It's an optional property in `options`,
    but a required one in general. If it wasn't set here, it must be set
    with React props.
    - `[values]` _(Function)_: A function that takes `props` and must
    return an object. Each key of that object refers the a place in the
    reducer under which a data will be stored. Each values must be an
    object with the following properties:
      - `promise` _(Function)_: A function that returns a promise.
      - `[args]` _(Array)_: Arguments that will be passed to
      the `promise` function.
      - `[maxAge]` _(Number)_: See [`moize` documentation](https://github.com/planttheidea/moize#advanced-usage).
      - `[maxArgs]` _(Number)_: See [`moize` documentation](https://github.com/planttheidea/moize#advanced-usage).
      - `[maxSize]` _(Number)_: See [`moize` documentation](https://github.com/planttheidea/moize#advanced-usage).

__Returns__

A function, that accepts a React component, and returns a higher-order
React component.

__Usage__

```jsx
import React, {PureComponent} from 'react';
import {reduxStatusAsync} from 'redux-status';

@reduxStatusAsync({
    name: 'Async', // 'name' is required
    values: props => ({ // 'values' is required too
        reddit: {
            args: [props.reddit],
            promise: reddit => fetch(`https://www.reddit.com/r/${reddit}.json`)
                .then(res => res.json())
                .then(res => res.data.children),
        },
    }),
})
class Async extends PureComponent {
    render() {
        const {status, reddit} = this.props;
        const {pending, refreshing, value} = status.reddit;

        if (!value) {
            return pending ? <h2>Loading...</h2> : <h2>Empty.</h2>;
        }

        return (
            <div style={{opacity: pending || refreshing ? 0.5 : 1}}>
                <ul>
                    {posts.map((post, i) => <li key={i}>{post.data.title}</li>)}
                </ul>
            </div>
        );
    }
}
```

---

### `reducer`

A status reducer that should be mounted to the Redux store under the
`status` key.

If you have to mount it to the key other than `status`, you may provide
a `getStatusState()` function to the [`reduxStatus()`](#reduxstatusoptions)
decorator.

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

---

### `selectors`

An object with Redux selectors.

#### `getStatusValue(statusName, [getStatusState])`

__Arguments__

1. `statusName` _(String)_: The name of the status you are connecting to.
Must be the same as the `name` you gave to [`reduxStatus()`](#reduxstatusoptions).
2. `[getStatusState]` _(Function)_: A function that takes the entire
Redux state and returns the state slice where the `redux-status`
was mounted. Defaults to `state => state.status`.

#### `getStatusMeta(statusName, [getStatusState])`

__Arguments__

1. `statusName` _(String)_: The name of the status you are connecting to.
Must be the same as the `name` you gave to [`reduxStatus()`](#reduxstatusoptions).
2. `[getStatusState]` _(Function)_: A function that takes the entire
Redux state and returns the state slice where the `redux-status`
was mounted. Defaults to `state => state.status`.

---

### `actions`

An object with all internal action creators. This is an advanced API
and most of the time shouldn't be used directly. It is recommended that
you use the actions passed down to the wrapped component,
as they are already bound to `dispatch()` and `statusName`.

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

---

### `actionTypes`

An object with Redux action types.

- `INITIALIZE` _(String)_
- `DESTROY` _(String)_
- `UPDATE` _(String)_
- `prefix` _(String)_

---
