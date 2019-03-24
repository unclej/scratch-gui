const SET_FULL_SCREEN = 'scratch-gui/mode/SET_FULL_SCREEN';
const SET_PLAYER = 'scratch-gui/mode/SET_PLAYER';

const initialState = {
    showBranding: false,
    isFullScreen: false,
    isPlayerOnly: false,
    hasEverEnteredEditor: true
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_FULL_SCREEN:
        return Object.assign({}, state, {
            isFullScreen: action.isFullScreen
        });
    case SET_PLAYER:
        return Object.assign({}, state, {
            isPlayerOnly: action.isPlayerOnly,
            hasEverEnteredEditor: state.hasEverEnteredEditor || !action.isPlayerOnly
        });
    default:
        return state;
    }
};

const setFullScreen = function (isFullScreen) {
    if (isFullScreen){
        document.getElementsByTagName('body')[0].classList.remove('full-app-screen');
        document.getElementsByTagName('html')[0].classList.remove('full-app-screen');
        document.getElementById('mainDivApp').classList.remove('full-app-screen');

        document.getElementsByTagName('body')[0].classList.add('only-player-app-screen');
        document.getElementsByTagName('html')[0].classList.add('only-player-app-screen');
        document.getElementById('mainDivApp').classList.add('only-player-app-screen');
        window.dispatchEvent(new Event('resize'));
    } else {
        document.getElementsByTagName('body')[0].classList.remove('only-player-app-screen');
        document.getElementsByTagName('html')[0].classList.remove('only-player-app-screen');
        document.getElementById('mainDivApp').classList.remove('only-player-app-screen');

        document.getElementsByTagName('body')[0].classList.add('full-app-screen');
        document.getElementsByTagName('html')[0].classList.add('full-app-screen');
        document.getElementById('mainDivApp').classList.add('full-app-screen');
        window.dispatchEvent(new Event('resize'));
    }
    return {
        type: SET_FULL_SCREEN,
        isFullScreen: isFullScreen
    };
};
const setPlayer = function (isPlayerOnly) {
    return {
        type: SET_PLAYER,
        isPlayerOnly: isPlayerOnly
    };
};

export {
    reducer as default,
    initialState as modeInitialState,
    setFullScreen,
    setPlayer
};
