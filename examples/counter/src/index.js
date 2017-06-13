import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {reducer as statusReducer} from 'redux-status';
import Counter from './components/Counter';

const reducers = combineReducers({
    status: statusReducer,
});

const store = createStore(reducers);

ReactDOM.render(
    <Provider store={store}>
        <Counter />
    </Provider>,
    document.getElementById('root')
);
