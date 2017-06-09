import * as actionTypes from './actionTypes';

export default function reduxStatusReducer(state, {type, name, payload}) {
    /* , meta */
    if (!state) {
        return {
            values: {},
            meta: {},
        };
    }

    switch (type) {
        case actionTypes.INITIALIZE: {
            const nextValues = {...state.values};
            const nextMeta = {...state.meta};

            if (nextValues[name] && nextMeta[name]) {
                nextMeta[name] = {...nextMeta[name], count: (nextMeta[name].count += 1)};
            }
            else {
                nextValues[name] = {...payload.initialValues};
                nextMeta[name] = {...payload, count: 1};
            }

            return {
                values: nextValues,
                meta: nextMeta,
            };
        }

        case actionTypes.DESTROY: {
            const nextValues = {...state.values};
            const nextMeta = {...state.meta};

            if (nextValues[name] && nextMeta[name] && nextMeta[name].count > 0 && nextMeta[name].persist) {
                nextMeta[name].count -= 1;
            }
            else {
                nextValues[name] = undefined;
                nextMeta[name] = undefined;
            }

            return {
                values: nextValues,
                meta: nextMeta,
            };
        }

        case actionTypes.UPDATE: {
            const nextValues = {...state.values};
            nextValues[name] = {...nextValues[name], ...payload};

            const nextMeta = {...state.meta};

            return {
                values: nextValues,
                meta: nextMeta,
            };
        }

        default:
            return state;
    }
}
