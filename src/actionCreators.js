import * as actionTypes from './actionTypes';

export function initialize(statusName, config) {
    return {
        type: actionTypes.INITIALIZE,
        name: statusName,
        payload: config,
    };
}

export function destroy(statusName) {
    return {
        type: actionTypes.DESTROY,
        name: statusName,
    };
}

export function update(statusName, payload) {
    return {
        type: actionTypes.UPDATE,
        name: statusName,
        payload,
    };
}
