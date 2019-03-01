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



describe('middleware-creator', () => {
    const middleware = generators.createMiddleware([]);

    it('should create a middleware', () => {
        expect(middleware).toBeInstanceOf(Function);
    });
    it('should pass through with empty handlers', () => {
        const { next, invoke } = createMock(middleware);
        const action = { type: 'ANY_ACTION' };
        invoke(action);
        expect(next).toHaveBeenCalledWith(action);
    });
    it('passes dispatch and getState', () => {
        const type = 'TEST_ACTION';
        const action = { type };
        const middleware = generators.createMiddleware({
            [type]: (state, calledAction, dispatch) => {
                expect(state).toEqual(store.getState());
                expect(calledAction).toEqual(action)
                dispatch('TEST DISPATCH')
            }
        });
        const { store, invoke } = createMock(middleware)
        invoke(action);
        expect(store.dispatch).toHaveBeenCalledWith('TEST DISPATCH')
        expect(store.getState).toHaveBeenCalled()
    });
});
