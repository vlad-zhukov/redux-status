import React from 'react';
import {render} from 'react-dom';
import {combineReducers, createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {reducer as statusReducer} from 'redux-status';
import {createLogger} from 'redux-logger';
import App from './containers/App';

const reducer = combineReducers({
    status: statusReducer,
});

const middleware = [];
if (process.env.NODE_ENV !== 'production') {
    middleware.push(createLogger({collapsed: true, duration: true}));
}

const store = createStore(reducer, applyMiddleware(...middleware));

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
