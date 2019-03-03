import * as generators from '../src/index';

const createMock = (middleware) => {
    const store = {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn()
    };
    const next = jest.fn();
    const invoke = (action) => middleware(store)(next)(action);

    return { store, next, invoke };
};

describe('async-middleware-creator', () => {
    const middleware = generators.createAsyncMiddleware();

    it('should create a middleware', () => {
        expect(middleware).toBeInstanceOf(Function);
    });

    it('should pass through on non async action', () => {
        const { next, invoke } = createMock(middleware);
        const action = { type: 'NON_ASYNC_ACTION' };
        invoke(action);
        expect(next).toHaveBeenCalledWith(action);
    });

    it('should pass through if shouldCallPromise returns false', () => {
        const { next, invoke } = createMock(middleware);
        const action = createAsyncActionMock(true, false);
        invoke(action);
        expect(next).toHaveBeenCalledWith(action);
    });

    it('should throw an error if types is not an array of string with length 3', () => {
        const { invoke } = createMock(middleware);

        expect(() => {
            invoke( { types: [] });
        }).toThrowError(new Error('The parameter `types` is expected to contain exactly 3 string elements'));

        expect(() => {
            invoke( { types: [1,2,3] });
        }).toThrowError(new Error('The parameter `types` is expected to contain exactly 3 string elements'));
    });

    it('should throw an error if promise is not a function', () => {
        const { invoke } = createMock(middleware);

        expect(() => {
            invoke({
                types: ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
                promise: 'stringValue'
            });
        }).toThrowError(new Error('The parameter `promise` is expected to be a function'));
    });

    it('should throw an error if shouldCallPromise is not a function', () => {
        const { invoke } = createMock(middleware);

        expect(() => {
            invoke({
                types: ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
                promise: () => {}
            });
        }).toThrowError(new Error('The parameter `shouldCallPromise` is expected to be a function'));
    });

    it('should throw an error if payload is not an object', () => {
        const { invoke } = createMock(middleware);

        expect(() => {
            invoke({
                types: ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
                promise: () => {},
                shouldCallPromise: () => true
            });
        }).toThrowError(new Error('The parameter `payload` is expected to be an object'));
    });

    it('should pass through after promise executed', () => {
        const { next, invoke } = createMock(middleware);
        const action = createAsyncActionMock(true);
        invoke(action);
        expect(next).toHaveBeenCalledWith(action);
    });

    it('should dispatch request and success action if promise resolves', () => {
        const { store } = createMock(middleware);
        const action = createAsyncActionMock(true);

        generators.callPromise(store.dispatch, action)
            .then(() => {
                expect(store.dispatch).toHaveBeenCalledWith({type: 'ASYNC_REQUEST'} );
                expect(store.dispatch).toHaveBeenCalledWith({type: 'ASYNC_SUCCESS', response: {}});
            });

    });

    it('should dispatch request and sucess action if promise resolves', () => {
        const { store } = createMock(middleware);
        const action = createAsyncActionMock(false);

        generators.callPromise(store.dispatch, action)
            .then(() => {
                expect(store.dispatch).toHaveBeenCalledWith({type: 'ASYNC_REQUEST'} );
                expect(store.dispatch).toHaveBeenCalledWith({type: 'ASYNC_FAILURE', error: {}});
            });

    });
});

const createAsyncActionMock = (resolves, shouldCallApi = true) => {
    return  {
        types: ['ASYNC_REQUEST', 'ASYNC_SUCCESS', 'ASYNC_FAILURE'],
        promise: () => {
            return new Promise((resolve, reject) => {
                resolves ? resolve({}) : reject({});
            });
        },
        shouldCallPromise: () => shouldCallApi,
        payload: {}
    };
};