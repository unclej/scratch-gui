// Polyfills
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'intl'; // For Safari 9

import React from 'react';
import ReactDOM from 'react-dom';

import analytics from '../lib/analytics';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import supportedBrowser from '../lib/supported-browser';

import styles from './index.css';

// Register "base" page view
analytics.pageview('/');

const scratchEditor = document.getElementById('scratch-editor');
window.SCRATCH_INIT = false;
window.initScratch = function (config, editor) {
    window.SCRATCH_INIT = true;
    const scratchEditor = document.getElementById('scratch-editor');
    const appTarget = document.createElement('div');
    appTarget.className = styles.app;
    appTarget.classList.add('only-player-app-screen');
    appTarget.id = 'mainDivApp';
    if(editor) {
        editor.appendChild(appTarget);
    } else if (scratchEditor){
        scratchEditor.appendChild(appTarget);
    } else {
        document.body.appendChild(appTarget);
    }


    if (supportedBrowser()) {
        // require needed here to avoid importing unsupported browser-crashing code
        // at the top level
        require('./render-gui.jsx').default(appTarget);

    } else {
        BrowserModalComponent.setAppElement(appTarget);
        const WrappedBrowserModalComponent = AppStateHOC(BrowserModalComponent, true /* localesOnly */);
        const handleBack = () => {};
        // eslint-disable-next-line react/jsx-no-bind
        ReactDOM.render(<WrappedBrowserModalComponent onBack={handleBack} />, appTarget);
    }

};
if (!scratchEditor && !process.env.ITCH_LESSONS){
    window.initScratch();
}
