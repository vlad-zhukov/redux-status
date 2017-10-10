import * as actionTypes from './actionTypes';
import * as promiseState from './promiseState';
import {extractAsyncValues} from './helpers';

export default function reduxStatusReducer(state, {type, name, payload}) {
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

            if (nextValues[name] !== undefined && nextMeta[name] !== undefined) {
                nextMeta[name] = {...nextMeta[name], count: (nextMeta[name].count += 1)};
            }
            else {
                const initialValues = {...payload.initialValues};

                if (payload.autoRefresh !== false) {
                    const asyncKeys = Object.keys(extractAsyncValues(payload));
                    for (let i = 0, l = asyncKeys.length; i < l; i++) {
                        initialValues[asyncKeys[i]] = promiseState.pending();
                    }
                }

                nextValues[name] = initialValues;
                nextMeta[name] = {
                    name: payload.name,
                    initialValues: payload.initialValues,
                    persist: payload.persist,
                    count: 1,
                };
            }

            return {
                values: nextValues,
                meta: nextMeta,
            };
        }

        case actionTypes.DESTROY: {
            const nextValues = {...state.values};
            const nextMeta = {...state.meta};

            if (
                nextValues[name] !== undefined &&
                nextMeta[name] !== undefined &&
                nextMeta[name].count > 0 &&
                nextMeta[name].persist === true
            ) {
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
            const nextMeta = {...state.meta};

            const payloadResult = typeof payload === 'function' ? payload(nextValues[name]) : payload;
            nextValues[name] = {...nextValues[name], ...payloadResult};

            return {
                values: nextValues,
                meta: nextMeta,
            };
        }

        default:
            return state;
    }
}
