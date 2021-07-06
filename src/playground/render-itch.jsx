/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable no-warning-comments */
import React from 'react';
import ReactDOM from 'react-dom';
// import {compose} from 'redux';

import AppStateHOC from '../lib/app-itch-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import ProjectItchHoc from '../lib/project-itch-hoc.jsx';
import {compose} from 'redux';
// import log from '../lib/log.js';
// import { connect } from 'react-redux';

// const onClickLogo = () => {
//     window.location = 'https://scratch.mit.edu';
// };

// const handleTelemetryModalCancel = () => {
//     log('User canceled telemetry modal');
// };

// const handleTelemetryModalOptIn = () => {
//     log('User opted into telemetry');
// };

// const handleTelemetryModalOptOut = () => {
//     log('User opted out of telemetry');
// };

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
const RenderITCH = function ({appTarget, state = {}, projectId, ...props}) {
    console.log(state, projectId, props);
    GUI.setAppElement(appTarget);
    const WrappedGui = compose(
        AppStateHOC,
        ProjectItchHoc
    )(GUI);
    ReactDOM.render(<WrappedGui
        projectId={projectId}
        {...props}
    />, appTarget);
    return <div />;
};

export default RenderITCH;
