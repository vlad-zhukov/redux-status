import * as actionTypes from './actionTypes';

export function initialize(statusName, config) {
    return {
        type: actionTypes.INITIALIZE,
        name: statusName,
        payload: config,
    };
}

export function destroy(statusName, persist) {
    return {
        type: actionTypes.DESTROY,
        name: statusName,
        meta: {persist},
    };
}

export function update(statusName, payload) {
    return {
        type: actionTypes.UPDATE,
        name: statusName,
        payload,
    };
}
