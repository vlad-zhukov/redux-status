export const getDisplayName = Comp => Comp.displayName || Comp.name || 'Unknown';

export function type(value) {
    if (value === null) return 'null';
    return typeof value;
}
