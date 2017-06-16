import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {reducer as statusReducer} from 'redux-status';
import ConnectedCounter from './components/Counter';

const reducers = combineReducers({
    status: statusReducer,
});

const store = createStore(reducers);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedCounter />
    </Provider>,
    document.getElementById('root')
);
