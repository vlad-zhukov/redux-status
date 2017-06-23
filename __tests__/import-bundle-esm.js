import {reduxStatus, reduxStatusAsync, reducer, selectors, actions, actionTypes} from '../dist/redux-status.esm';

describe('import-bundle-esm', () => {
    it('should export properly', () => {
        expect(typeof reduxStatus).toBe('function');
        expect(typeof reduxStatusAsync).toBe('function');
        expect(typeof reducer).toBe('function');
        expect(typeof selectors).toBe('object');
        expect(typeof actions).toBe('object');
        expect(typeof actionTypes).toBe('object');
    });
});
