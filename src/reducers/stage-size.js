import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';
import ITCH_CONFIG from '../../itch.config';
import FULLSCREEN from '../lib/screen-full';

import screenfull from 'screenfull';


const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';
const SET_FULL_SCREEN = 'scratch-gui/mode/SET_FULL_SCREEN';
const SET_WINDOW_FULLSCREEN = 'scratch-gui/mode/SET_WINDOW_FULLSCREEN';

const initialState = {
    isFullScreen: true,
    isWindowFullScreen: false,
    isProjectPage: (window.self !== window.top),
    stageSize: STAGE_DISPLAY_SIZES.large
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return Object.assign({}, state, {
            isFullScreen: state.isFullScreen,
            stageSize: action.stageSize,
            isProjectPage: state.isProjectPage
        });
    case SET_FULL_SCREEN:
        return Object.assign({}, state, {
            isFullScreen: action.isFullScreen,
            stageSize: state.stageSize,
            isProjectPage: (typeof action.isProjectPage === 'undefined') ? state.isProjectPage : action.isProjectPage
        });
    case SET_WINDOW_FULLSCREEN:
        return Object.assign({}, state, {
            isWindowFullScreen: !state.isWindowFullScreen
        });
    default:
        return state;
    }
};

const setStageSize = function (stageSize) {
    return {
        type: SET_STAGE_SIZE,
        stageSize: stageSize
    };
};

// `isFullScreen` is a separate value because "stage size" does not
// actually apply to full screen mode, so they are treated as separate
// values to be assessed.
const setFullScreen = function (isFullScreen) {
    return {
        type: SET_FULL_SCREEN,
        isFullScreen: isFullScreen
    };
};

const setProjectPage = function (){
    let isProjectPage = false;
    window.__IS_PROJECT_PAGE = false;
    if (window.self !== window.top){
        isProjectPage = true;
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        document.getElementsByTagName('body')[0].classList.remove('full-app-screen');
        document.getElementsByTagName('html')[0].classList.remove('full-app-screen');
        document.getElementById('mainDivApp').classList.remove('full-app-screen');

        document.getElementsByTagName('body')[0].classList.add('only-player-app-screen');
        document.getElementsByTagName('html')[0].classList.add('only-player-app-screen');
        document.getElementById('mainDivApp').classList.add('only-player-app-screen');
        if (FULLSCREEN.enabled) {
            if (FULLSCREEN.isFullscreen){
                FULLSCREEN.toggle();
            }
        }
        const largeButton = document.getElementById('buttonToSetStageSizeLarge');
        if (largeButton){
            largeButton.click();
        }
        parent.postMessage(['setFullScreen', [true]], (
            (typeof keyValue.baseUrl === 'undefined') ?
                (ITCH_CONFIG.BASE_URL + ITCH_CONFIG.BASE_URL_EXTENSION) :
                keyValue.baseUrl)
        );
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }
    return {
        type: SET_FULL_SCREEN,
        isFullScreen: true,
        isProjectPage: isProjectPage
    };
};
const setToEditProjectPage = function (){
    let isProjectPage = false;
    window.__IS_PROJECT_PAGE = true;
    if (window.self !== window.top){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        document.getElementsByTagName('body')[0].classList.remove('only-player-app-screen');
        document.getElementsByTagName('html')[0].classList.remove('only-player-app-screen');
        document.getElementById('mainDivApp').classList.remove('only-player-app-screen');

        document.getElementsByTagName('body')[0].classList.add('full-app-screen');
        document.getElementsByTagName('html')[0].classList.add('full-app-screen');
        document.getElementById('mainDivApp').classList.add('full-app-screen');
        isProjectPage = false;
        parent.postMessage(['setFullScreen', [false]], (
            (typeof keyValue.baseUrl === 'undefined') ?
                (ITCH_CONFIG.BASE_URL + ITCH_CONFIG.BASE_URL_EXTENSION) :
                keyValue.baseUrl)
        );
    }
    return {
        type: SET_FULL_SCREEN,
        isFullScreen: false,
        isProjectPage: isProjectPage
    };
};
const setWindowFullScreen = function (){
    if (screenfull.enabled) {
        screenfull.toggle();
    }
    return {
        type: SET_WINDOW_FULLSCREEN
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize,
    setFullScreen,
    setProjectPage,
    setToEditProjectPage,
    setWindowFullScreen
};
