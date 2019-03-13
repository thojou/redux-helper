/**
 * Create an action.
 *
 * @example <caption>Create an empty action</caption>
 * const HEARTBEAT = 'heartbeat'
 * const heartbeat = createAction(HEARTBEAT)
 * const reduxAction = heartbeat()
 *
 * console.log(reduxAction); // { type: 'heartbeat' }
 *
 * @example <caption>Action with at least one parameter</caption>
 * const ADD_POST = 'post/add'
 * const addPost = createAction(ADD_POST, 'title')
 * const reduxAction = addPost('New post')
 *
 * console.log(reduxAction); // { type: 'post/add', title: 'New post'}
 *
 * @param {string}      type     - The actions type.
 * @param {...[string]} argNames - The actions argument names.
 * @returns {function(...args): {type:string}}
 */
export const createAction = (type, ...argNames) => {
    return (...args) => {
        let action = { type };

        for (const index in argNames) {
            action[argNames[index]] = args[index];
        }

        return action;
    };
};

/**
 * Create request, success and failure type for async actions.
 *
 * @example <caption>Create an array of async action types</caption>
 * const [REQUEST_TYPE, SUCCESS_TYPE, FAILURE_TYPE] = createAsyncActionTypes('call/api')
 *
 * console.log(REQUEST_TYPE); // call/api/request
 * console.log(SUCCESS_TYPE); // call/api/success
 * console.log(FAILURE_TYPE); // call/api/failure
 *
 * @param {string} type - The type base name
 * @param {string} delimiter - A delimiter string
 * @returns {Array<string>}
 */
export const createAsyncActionTypes = (type, delimiter = '/') => {
    return [
        type + delimiter + 'request',
        type + delimiter + 'success',
        type + delimiter + 'failure'
    ];
};

/**
 * Create an async action.
 *
 * @param {string[]} types             - An array with async action types.
 * @param {Function} promise           - The async action to be executed
 * @param {Function} shouldCallPromise - Function to determine if the promise should be executed.
 * @param {...*}     argNames          - List of all property names which will passed as payload.
 * @returns {function(...[*]): {types: *, payload: {}, shouldCallPromise: (function(): boolean), promise: function}}
 */
export const createAsyncAction = (types, promise, shouldCallPromise = () => true, ...argNames) => {
    const actionTemplate = { types, promise, shouldCallPromise, payload: {} };

    throwErrorOnInvalidAsyncAction(actionTemplate);

    return (...args) => {
        const action = { ...actionTemplate };

        for (const index in argNames) {
            action.payload[argNames[index]] = args[index];
        }

        return action;
    };
};

/**
 * Create a middleware
 *
 * @param {object} handlers - Handlers which will be triggered by an action.
 * @returns {function({dispatch?: *, getState?: *}): function(*): Function}
 */
export const createMiddleware = (handlers) => {
    return ({ dispatch, getState }) => {
        return next => action => {
            if (handlers.hasOwnProperty(action.type)) {
                handlers[action.type](getState(), action, dispatch);
            }

            next(action);
        };
    };
};

/**
 * Create the middleware for async actions.
 * @returns {function({dispatch?: *, getState?: *}): function(*): Function}
 */
export const createAsyncMiddleware = () => {
    return ({ dispatch, getState }) => {
        return next => action => {

            if (!action.hasOwnProperty('types')) {
                return next(action);
            }

            throwErrorOnInvalidAsyncAction(action);

            if (!action.shouldCallPromise(getState())) {
                return next(action);
            }

            callPromise(dispatch, action);

            return next(action);
        };
    };
};

/**
 *
 * @param {object} action - The async action
 * @private
 */
export const throwErrorOnInvalidAsyncAction = (action) => {
    const { types, promise, shouldCallPromise, payload } = action;

    if (
        !Array.isArray(types) ||
        types.length !== 3 ||
        !types.every(type => typeof type === 'string')
    ) {
        throw new Error('The parameter `types` is expected to contain exactly 3 string elements');
    }

    if (typeof promise !== 'function') {
        throw new Error('The parameter `promise` is expected to be a function');
    }

    if (typeof shouldCallPromise !== 'function') {
        throw new Error('The parameter `shouldCallPromise` is expected to be a function');
    }

    if (typeof payload !== 'object') {
        throw new Error('The parameter `payload` is expected to be an object');
    }
};

/**
 * Call an actions promise and dispatch the sub actions.
 * @param {function} dispatch
 * @param {object}   action
 * @returns {Promise}
 */
export const callPromise = (dispatch, action) => {
    const { types, payload, promise } = action;
    const [requestType, successType, failureType] = types;

    dispatch({ type: requestType, ...payload });

    return promise(...Object.values(payload))
        .then((response) => {
            dispatch({ type: successType, ...payload, response });
        })
        .catch((error) => {
            dispatch({ type: failureType, ...payload, error });
        });
};


