/* eslint-disable react/prop-types */
import React from 'react';
import ReactDOM from 'react-dom';

import GUI from '../containers/gui.jsx';
import GuiReducer, {guiInitialState, guiMiddleware, initProject} from '../reducers/gui';
import LocalesReducer, {localesInitialState, initLocale} from '../reducers/locales';
import {ScratchPaintReducer} from 'scratch-paint';
import {setAppElement} from 'react-modal';
import sessionReducer, {sessionInitialState} from '../reducers/session';
import {defaultProjectId} from '../reducers/project-state';
import {combineReducers, compose, createStore} from 'redux';
import {defaults} from 'lodash';
import {Provider} from 'react-redux';
import ConnectedIntlProvider from '../lib/connected-intl-provider.jsx';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const getStoreConfig = () => {
    let store;
    return {
        create: (allReducers, initialState = {}, enhancer) => {
            if (!store) {
                store = createStore(
                    allReducers,
                    initialState || {},
                    enhancer,
                );
            }
            return store;
        }
    };
};
const storeConfig = getStoreConfig();
/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
// const initGuiState = gI => {
//     const pathname = window.location.pathname.toLowerCase();
//     const parts = pathname.split('/').filter(Boolean);
//     // parts[0]: 'projects'
//     // parts[1]: either :id or 'editor'
//     // parts[2]: undefined if no :id, otherwise either 'editor' or 'fullscreen'
//     if (parts.indexOf('editor') === -1) {
//         gI = initPlayer(gI);
//     }
//     if (parts.indexOf('fullscreen') !== -1) {
//         gI = initFullScreen(gI);
//     }
//     return gI;
// };

// eslint-disable-next-line require-jsdoc
export default function RenderITCH ({appTarget, state = {}, projectId, ...props}) {

    const guiReducers = {
        locales: LocalesReducer,
        scratchGui: GuiReducer,
        scratchPaint: ScratchPaintReducer,
        session: sessionReducer
    };
    const initialState = {
        locales: initLocale(localesInitialState, window._locale),
        scratchGui: initProject(guiInitialState, projectId || defaultProjectId),
        session: sessionInitialState,
        ...state
    };
    GUI.setAppElement(appTarget);
    setAppElement(appTarget);
    const enhancer = composeEnhancers(guiMiddleware);
    
    const allReducers = combineReducers(defaults(guiReducers));
    const store = storeConfig.create(allReducers, initialState, enhancer);

    // eslint-disable-next-line no-console
    console.log(store, initialState);
    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    // const WrappedGui = compose(
    //     AppStateHOC,
    //     HashParserHOC
    // )(GUI);
    if (store) {
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedIntlProvider>
                    <GUI {...props} />
                </ConnectedIntlProvider>
            </Provider>
            , appTarget);
    }
    return <div />;
}
