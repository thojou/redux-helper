import * as generators from '../src/index';

describe('action-generator', () => {
    it('should create a redux action creator', () => {
        expect(generators.createAction('ACTION_TYPE', 'value')).toBeInstanceOf(Function)
    });

    it('should create a redux action', () => {
        const expectedAction = {
            type: 'ACTION_TYPE',
            value: 1
        };
        const action = generators.createAction('ACTION_TYPE', 'value');

        expect(action(1)).toEqual(expectedAction);
    });

    it('should ignore extra parameters', () => {
        const expectedAction = {
            type: 'ACTION_TYPE',
            value: 1
        };
        const action = generators.createAction('ACTION_TYPE', 'value');

        expect(action(1, 2)).toEqual(expectedAction);
    })
});

describe('asnyc-action-generator', () => {
    it('should create a redux async action creator', () => {
        expect(generators.createAsyncAction(
            ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
            (value) => new Promise(),
            () => true,
            'value'
        )).toBeInstanceOf(Function)
    });

    it('should create a redux async action', () => {
        const types = ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'];
        const asyncActionCreator = generators.createAsyncAction(
            types,
            (value) => new Promise(),
            () => true,
            'value'
        );
        const asyncAction = asyncActionCreator(1);

        expect(asyncAction.types).toEqual(types);
        expect(asyncAction.promise).toBeInstanceOf(Function);
        expect(asyncAction.shouldCallPromise).toBeInstanceOf(Function);
        expect(asyncAction.payload).toEqual({value: 1})
    });

    it('should ignore extra parameters', () => {
        const types = ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'];
        const asyncActionCreator = generators.createAsyncAction(
            types,
            (value) => new Promise(),
            () => true,
            'value'
        );
        const asyncAction = asyncActionCreator(1, 2);

        expect(asyncAction.payload).toEqual({value: 1})
    });

    it('should throw an error if types array lentgh is not equals 3', () => {
        expect(() => {
            generators.createAsyncAction(
                ['ASYNC_REQUEST', 'ASYNC_SUCCESS'],
                (value) => new Promise()
            );
        }).toThrowError(new Error('The parameter `types` is expected to contain exactly 3 string elements'));
    });

    it('should throw an error if promise is not a function', () => {
        expect(() => {
            generators.createAsyncAction(
                ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
                "stringValue"
            );
        }).toThrowError(new Error('The parameter `promise` is expected to be a function'));
    });
});
