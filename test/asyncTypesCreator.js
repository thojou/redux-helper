import * as generators from '../src/index';

describe('async-types-creator', () => {
    it('should create async types', () => {
        const expectedTypes = [
            'my/action/request',
            'my/action/success',
            'my/action/failure',
        ]

        expect(generators.createAsyncActionTypes('my/action')).toEqual(expectedTypes);
    });

    it('should create async types with diferent delimiter', () => {
        const expectedTypes = [
            'my.action.request',
            'my.action.success',
            'my.action.failure',
        ]

        expect(generators.createAsyncActionTypes('my.action', '.')).toEqual(expectedTypes);
    });
});
