/* eslint-disable react/prop-types */
import React from 'react';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';


/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
// eslint-disable-next-line require-jsdoc
export default function RenderITCH ({appTarget, ...props}) {
    GUI.setAppElement(appTarget);
    // eslint-disable-next-line no-console
    console.log(appTarget, props);
    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    return <WrappedGui {...props} />;
}
