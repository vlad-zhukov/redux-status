import React from 'react';
import {render} from 'react-dom';
import {combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducer as statusReducer} from 'redux-status';
import App from './containers/App';

const reducer = combineReducers({
    status: statusReducer,
});

let enhancer;
/* eslint-disable no-underscore-dangle */
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION__();
}
/* eslint-enable no-underscore-dangle */

const store = createStore(reducer, enhancer);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
