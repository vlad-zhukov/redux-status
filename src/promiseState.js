/* eslint-disable no-shadow */

/**
 * Constructor for creating a new promiseState.
 * @param [pending] {Boolean}
 * @param [refreshing] {Boolean}
 * @param [fulfilled] {Boolean}
 * @param [rejected] {Boolean}
 * @param [value] {*}
 * @param [reason] {*}
 * @returns {Object}
 */
function create({
    pending = false,
    refreshing = false,
    fulfilled = false,
    rejected = false,
    value = null,
    reason = null,
}) {
    return {
        pending,
        refreshing,
        fulfilled,
        rejected,
        value,
        reason,
    };
}

/**
 * Creates a new promiseState that is pending.
 * @returns {Object}
 */
export function pending() {
    return create({pending: true});
}

/**
 * Creates a promiseState that is refreshing.
 * Can be called without a previous promiseState and will be both pending and refreshing.
 * @param [previous] {Object}
 * @returns {Object}
 */
export function refreshing(previous = pending()) {
    return create({
        pending: previous.pending,
        refreshing: true,
        fulfilled: previous.fulfilled,
        rejected: previous.rejected,
        value: previous.value,
        reason: previous.reason,
    });
}

/**
 * Creates a promiseState that is resolved with the given value.
 * If the given value is already a promiseState, it will be returned as is and ignore the provided meta.
 * @param [value] {*}
 * @returns {Object}
 */
export function fulfilled(value) {
    return create({fulfilled: true, value});
}

/**
 * Creates a promiseState that is rejected with the given reason.
 * @param reason {*}
 * @returns {Object}
 */
export function rejected(reason) {
    return create({rejected: true, reason});
}
