/**
 * Create an action.
 *
 * @param type
 * @param argNames
 * @returns {function(...[*]): {type: *}}
 */
export const createAction = (type, ...argNames) => {
    return (...args) => {
        let action = { type };

        for(const index in argNames) {
            action[argNames[index]] = args[index];
        }

        return action;
    };
};

/**
 * Create request, success and failure type for async actions.
 *
 * @param {string} type - The type base name
 * @param {string} delimiter - A delimiter string
 * @returns {string[]}
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
 * @returns {function(...[*]): {types: *, payload: {}, shouldCallPromise: (function(): boolean), promise: *}}
 */
export const createAsyncAction = (types, promise, shouldCallPromise = () => true, ...argNames) => {
    const actionTemplate = { types, promise, shouldCallPromise, payload: {} };

    throwErrorOnInvalidAsyncAction(actionTemplate);

    return (...args) => {
        const action = { ...actionTemplate };

        for(const index in argNames) {
            action.payload[argNames[index]] = args[index];
        }

        return action;
    };
};

export const createMiddleware = (handlers) => {
    return ({dispatch, getState}) => {
        return next => action => {
            if(handlers.hasOwnProperty(action.type)) {
                handlers[action.type](getState(), action, dispatch);
            }

            next(action);
        };
    };
};

export const createAsyncMiddleware = () => {
    return ({dispatch, getState}) => {
        return next => action => {

            if (!action.hasOwnProperty('types')) {
                return next(action);
            }

            throwErrorOnInvalidAsyncAction(action);

            if(!action.shouldCallPromise(getState())) {
                return next(action);
            }

            callPromise(dispatch, action);

            return next(action);
        };
    };
};

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

export const callPromise = (dispatch, action) => {
    const { types, payload, promise } = action;
    const [ requestType, successType, failureType ] = types;

    dispatch({type: requestType, ...payload});

    return promise(...Object.values(payload))
        .then((response) => {
            dispatch({type: successType, ...payload, response});
        })
        .catch((error) => {
            dispatch({type: failureType, ...payload, error});
        });
};


