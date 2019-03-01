export const createAction = (type, ...argNames) => {
    return (...args) => {
        let action = { type };

        for(const index in argNames) {
            action[argNames[index]] = args[index];
        }

        return action;
    };
};

export const createAsyncActionTypes = (type, delimiter = '/') => {
    return [
        type + delimiter + 'request',
        type + delimiter + 'success',
        type + delimiter + 'failure'
    ];
};

export const createAsyncAction = (types, promise, shouldCallPromise = () => true, ...argNames) => {
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


    return (...args) => {
        const action = { types, promise, shouldCallPromise, payload: {} };

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
