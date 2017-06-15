const {
    reduxStatus,
    reducer,
    selectors,
    actions,
    actionTypes,
} = require('../dist/redux-status.cjs');

describe('import-bundle-cjs', () => {
    it('should export properly', () => {
        expect(typeof reduxStatus).toBe('function');
        expect(typeof reducer).toBe('function');
        expect(typeof selectors).toBe('object');
        expect(typeof actions).toBe('object');
        expect(typeof actionTypes).toBe('object');
    });
});
