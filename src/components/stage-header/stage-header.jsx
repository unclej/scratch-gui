import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import Controls from '../../containers/controls.jsx';
import {getStageDimensions} from '../../lib/screen-utils';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';

import fullScreenIcon from './icon--fullscreen.svg';
import largeStageIcon from './icon--large-stage.svg';
import smallStageIcon from './icon--small-stage.svg';
import unFullScreenIcon from './icon--unfullscreen.svg';
import closeIcon from './close_black.svg';
import windowFullScreenIcon from './up_arrow.svg';
import windowExitFullScreenIcon from './down_arrow.svg';

import styles from './stage-header.css';

const messages = defineMessages({
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to change stage size to large',
        id: 'gui.stageHeader.stageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.stageSizeSmall'
    },
    fullStageSizeMessage: {
        defaultMessage: 'Enter full screen mode',
        description: 'Button to change stage size to full screen',
        id: 'gui.stageHeader.stageSizeFull'
    },
    unFullStageSizeMessage: {
        defaultMessage: 'Exit full screen mode',
        description: 'Button to get out of full screen mode',
        id: 'gui.stageHeader.stageSizeUnFull'
    },
    fullscreenControl: {
        defaultMessage: 'Full Screen Control',
        description: 'Button to enter/exit full screen mode',
        id: 'gui.stageHeader.fullscreenControl'
    }
});

const StageHeaderComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        isProjectPage,
        isWindowFullScreen,
        onKeyPress,
        onSetStageLarge,
        onSetStageSmall,
        onSetStageFull,
        onSetStageUnFull,
        onSetWindowFullScreen,
        onSetToEditProject,
        onSetProjectPageFromUnFull,
        onSetProjectPageFromFull,
        stageSizeMode,
        vm
    } = props;

    let header = null;
    const isIpad = (navigator.userAgent.match(/iPad/i) !== null);
    const windowFullscreenControl = isIpad ? ([]) : (
        <Button
            className={classNames(
                styles.stageFullscreenButton
            )}
            onClick={onSetWindowFullScreen}
            onKeyPress={onKeyPress}
        >
            {isWindowFullScreen ? (
                <img
                    alt="Exit Fullscreen"
                    className={classNames(styles.stageButtonIcon)}
                    draggable={false}
                    id="img_down_arrow_for_exitfullscreen"
                    src={windowExitFullScreenIcon}
                    title="Exit Fullscreen"
                />
            ) : (
                <img
                    alt="Set window Fullscreen"
                    className={styles.stageButtonIcon}
                    draggable={false}
                    id="img_up_arrow_for_fullscreen"
                    src={windowFullScreenIcon}
                    title="Fullscreen"
                />

            )}
        </Button>
    );
    const stageControls =
        isPlayerOnly ? (
            []
        ) : (
            <div className={styles.stageSizeToggleGroup}>
                <div>
                    <Button
                        className={classNames(
                            styles.stageButton,
                            styles.stageButtonFirst,
                            (stageSizeMode === STAGE_SIZE_MODES.small) ? null : styles.stageButtonToggledOff,
                        )}
                        onClick={onSetStageSmall}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.smallStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={smallStageIcon}
                        />
                    </Button>
                </div>
                <div>
                    <Button
                        className={classNames(
                            styles.stageButton,
                            styles.stageButtonLast,
                            (stageSizeMode === STAGE_SIZE_MODES.large) ? null : styles.stageButtonToggledOff
                        )}
                        id="buttonToSetStageSizeLarge"
                        onClick={onSetStageLarge}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.largeStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={largeStageIcon}
                        />
                    </Button>
                </div>
            </div>
        );
    const stageDimensions = getStageDimensions(null, true);
    header = (
        <Box className={isProjectPage || isFullScreen ? styles.stageHeaderWrapperOverlay : styles.stageHeaderWrapper}>
            <Box
                className={styles.stageMenuWrapper}
                style={isFullScreen ? {width: stageDimensions.width} : ''}
            >
                <Controls vm={vm} />
                {isProjectPage ? (
                    <div
                        className={styles.rightButtons}
                    >
                        <Button
                            className={classNames(
                                styles.stageButton,
                                styles.stageButtonFirst,
                                (stageSizeMode === STAGE_SIZE_MODES.small) ? null : styles.stageButtonToggledOff,
                                styles.stageFullscreenButton,
                                styles.hidden
                            )}
                            id="scratch-header-fullscreen-btn"
                            onClick={onSetToEditProject}
                            onKeyPress={onKeyPress}
                        >
                            <img
                                alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={unFullScreenIcon}
                                title="Full Screen Control"
                            />
                        </Button>
                    </div>
                ) : (isFullScreen ? (
                    <div
                        className={styles.rightButtons}
                    >
                        <Button
                            className={styles.stageFullscreenButton}
                            id="scratch-header-fullscreen-btn"
                            onClick={onSetStageUnFull}
                            onKeyPress={onKeyPress}
                        >
                            <img
                                alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={unFullScreenIcon}
                                title={props.intl.formatMessage(messages.fullscreenControl)}
                            />
                        </Button>
                        {windowFullscreenControl}
                        <Button
                            className={styles.projectButton}
                            onClick={onSetProjectPageFromUnFull}
                            onKeyPress={onKeyPress}
                        >
                            <img
                                alt="See Project Page"
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={closeIcon}
                                title="See Project Page"
                            />
                        </Button>
                    </div>
             
                ) : (
                    <div className={styles.stageSizeRow}>
                        {stageControls}
                        <div className={styles.rightButtons}>
                            <Button
                                className={styles.stageFullscreenButton}
                                onClick={onSetStageFull}
                            >
                                <img
                                    alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={fullScreenIcon}
                                    title="Full Screen Control"
                                />
                            </Button>
                            {windowFullscreenControl}
                            <Button
                                className={styles.projectButton}
                                onClick={onSetProjectPageFromFull}
                                onKeyPress={onKeyPress}
                            >
                                <img
                                    alt="See Project Page"
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={closeIcon}
                                    title="See Project Page"
                                />
                            </Button>
                        </div>
                    </div>
                
                ))}
            </Box>
        </Box>
    );
    
    /* if (isProjectPage) {
        header = (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                >
                    <Controls vm={vm} />
                    <div
                        className={styles.rightButtons}
                    >
                        <Button
                            className={classNames(
                                styles.stageButton,
                                styles.stageButtonFirst,
                                (stageSizeMode === STAGE_SIZE_MODES.small) ? null : styles.stageButtonToggledOff,
                                styles.stageFullscreenButton,
                                styles.hidden
                            )}
                            id="scratch-header-fullscreen-btn"
                            onClick={onSetToEditProject}
                            onKeyPress={onKeyPress}
                        >
                            <img
                                alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={unFullScreenIcon}
                                title="Full Screen Control"
                            />
                        </Button>
                    </div>
                </Box>
            </Box>
        );
    } else if (isFullScreen) {
        header = (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                    style={{width: stageDimensions.width}}
                >
                    <Controls vm={vm} />
                    <Button
                        className={styles.stageButton}
                        onClick={onSetStageUnFull}
                        onKeyPress={onKeyPress}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={unFullScreenIcon}
                            title={props.intl.formatMessage(messages.fullscreenControl)}
                        />
                    </Button>
                </Box>
            </Box>
        );
    } else {
        
        header = (
            <Box className={styles.stageHeaderWrapper}>
                <Box className={styles.stageMenuWrapper}>
                    <Controls vm={vm} />
                    <div className={styles.stageSizeRow}>
                        {stageControls}
                        <div>
                            <Button
                                className={styles.stageButton}
                                onClick={onSetStageFull}
                            >
                                <img
                                    alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={fullScreenIcon}
                                    title={props.intl.formatMessage(messages.fullscreenControl)}
                                />
                            </Button>
                        </div>
                    </div>
                </Box>
            </Box>
        );
    } */

    return header;
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    stageSizeMode: state.scratchGui.stageSize.stageSize
});

StageHeaderComponent.propTypes = {
    intl: intlShape,
    isFullScreen: PropTypes.bool.isRequired,
    isPlayerOnly: PropTypes.bool.isRequired,
    isProjectPage: PropTypes.bool.isRequired,
    isWindowFullScreen: PropTypes.bool.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onSetProjectPageFromFull: PropTypes.func.isRequired,
    onSetProjectPageFromUnFull: PropTypes.func.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    onSetStageLarge: PropTypes.func.isRequired,
    onSetStageSmall: PropTypes.func.isRequired,
    onSetStageUnFull: PropTypes.func.isRequired,
    onSetToEditProject: PropTypes.func.isRequired,
    onSetWindowFullScreen: PropTypes.func.isRequired,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

StageHeaderComponent.defaultProps = {
    stageSizeMode: STAGE_SIZE_MODES.large
};

export default injectIntl(connect(
    mapStateToProps
)(StageHeaderComponent));
