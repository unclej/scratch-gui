/* eslint-disable react/no-unused-prop-types */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Box from '../components/box/box.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import {setPlayer} from '../reducers/mode';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

import styles from './player.css';

const Player = ({isPlayerOnly, projectId}) => (
    <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
        <GUI
            canEditTitle
            enableCommunity
            isPlayerOnly={isPlayerOnly}
            projectId={projectId}
            canSave={false}
            showBranding={false}
            showOtherButtons={false}
        />
    </Box>
);

Player.propTypes = {
    isPlayerOnly: PropTypes.bool,
    onSeeInside: PropTypes.func,
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSeeInside: () => dispatch(setPlayer(false))
});

const ConnectedPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer = compose(
    AppStateHOC,
    HashParserHOC
)(ConnectedPlayer);

const appTarget = document.createElement('div');
appTarget.classList.add('only-player-app-screen');
appTarget.id = 'mainDivApp';
const scratchEditor = document.getElementById('scratch-editor');
window.SCRATCH_INIT = false;
window.initScratch = function (config, editor) {
    window.SCRATCH_INIT = true;
    if (editor) {
        editor.appendChild(appTarget);
    } else if (scratchEditor) {
        scratchEditor.appendChild(appTarget);
    } else {
        document.body.appendChild(appTarget);
    }
};
if (!scratchEditor && !process.env.ITCH_LESSONS) {
    window.initScratch();
}

ReactDOM.render(<WrappedPlayer
    isPlayerOnly
    isFullScreen
/>, appTarget);
