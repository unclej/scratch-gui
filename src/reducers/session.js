const UPDATE_SESSION = 'scratch-gui/session/UPDATE_SESSION';

const initialState = {
    session: {user: {username: 'test'}}
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case UPDATE_SESSION:
        return Object.assign({}, state, {
            session: action.session
        });
    default:
        return state;
    }
};
const updateSession = function (sessionObj) {
    return {
        type: UPDATE_SESSION,
        session: sessionObj
    };
};
export {
    reducer as default,
    initialState as sessionInitialState,
    updateSession
};
