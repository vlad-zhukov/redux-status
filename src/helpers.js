export const getDisplayName = Comp => Comp.displayName || Comp.name || 'Unknown';

export function assignDefined(target, source, props) {
    const keys = Array.isArray(props) ? props : Object.keys(source);
    for (let i = 0, l = keys.length; i < l; i++) {
        if (source[i] !== undefined) {
            target[i] = source[i]; // eslint-disable-line no-param-reassign
        }
    }
    return target;
}
