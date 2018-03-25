const SET_FULL_SCREEN = 'scratch-gui/mode/SET_FULL_SCREEN';
const SET_PLAYER = 'scratch-gui/mode/SET_PLAYER';

const initialState = {
    isFullScreen: true,
    isPlayerOnly: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_FULL_SCREEN:
        return {
            isFullScreen: action.isFullScreen,
            isPlayerOnly: state.isPlayerOnly
        };
    case SET_PLAYER:
        return {
            isFullScreen: state.isFullScreen,
            isPlayerOnly: action.isPlayerOnly
        };
    default:
        return state;
    }
};

const setFullScreen = function (isFullScreen) {
   if(isFullScreen){
    document.getElementsByTagName("body")[0].classList.remove("full-app-screen");
    document.getElementsByTagName("body")[0].classList.add("only-player-app-screen");
    window.dispatchEvent(new Event('resize'));
   }else{
    document.getElementsByTagName("body")[0].classList.remove("only-player-app-screen");
    document.getElementsByTagName("body")[0].classList.add("full-app-screen");
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
