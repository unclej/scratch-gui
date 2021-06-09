const UPDATE_SESSION = 'scratch-gui/session/UPDATE_SESSION';

const initialState = {
    session: {
        user: {
            id: 0,
            banned: false,
            username: 'Guest',
            token: '',
            thumbnailUrl: '',
            dateJoined: '',
            email: ''
        },
        permissions: {
            admin: false,
            scratcher: false,
            new_scratcher: true,
            social: false,
            educator: false,
            educator_invitee: false,
            student: false
        },
        flags: {
            must_reset_password: false,
            must_complete_registration: false,
            has_outstanding_email_confirmation: false,
            show_welcome: true,
            confirm_email_banner: true,
            unsupported_browser_banner: true
        }
    }
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
