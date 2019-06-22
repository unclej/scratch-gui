const UPDATE_SESSION = 'scratch-gui/session/UPDATE_SESSION';

const initialState = {
    session: {
        user: {
            id: 41620062,
            banned: false,
            username: 'ptoska',
            token: '45bb4c94bccd49c1875477e5a5bc8485:qSx_8wRgzgRvhPA-ckpBikBZjyI',
            thumbnailUrl: '//cdn2.scratch.mit.edu/get_image/user/default_32x32.png',
            dateJoined: '2019-02-22T16:04:53',
            email: 'toskapasho@gmail.com'
        },
        permissions: {
            admin: false,
            scratcher: false,
            new_scratcher: true,
            social: true,
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
