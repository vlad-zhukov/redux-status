export const getDisplayName = Comp => Comp.displayName || Comp.name || 'Unknown';

export function type(value) {
    if (value === null) return 'null';
    return typeof value;
}

export function extractAsyncValues(props) {
    if (type(props.asyncValues) !== 'function') {
        return {};
    }

    const values = props.asyncValues(props);

    if (type(values) !== 'object') {
        throw new TypeError(
            `ReduxStatus: property 'asyncValues' must be a function that returns an object, but got: '${type(values)}'.`
        );
    }

    return values;
}
