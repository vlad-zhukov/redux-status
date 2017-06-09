const defaultStatusState = state => state.status;

export function getStatusValue(statusName, getStatusState = defaultStatusState) {
    return state => getStatusState(state).values[statusName];
}

export function getStatusMeta(statusName, getStatusState = defaultStatusState) {
    return state => getStatusState(state).meta[statusName];
}
