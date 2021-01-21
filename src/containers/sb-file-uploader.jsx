import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import xhr from 'xhr';
import {setProjectTitle} from '../reducers/project-title';

import log from '../lib/log';
import sharedMessages from '../lib/shared-messages';
import storage from '../lib/storage';

import {
    LoadingStates,
    getIsLoadingUpload,
    getIsShowingWithoutId,
    onLoadedProject,
    requestProjectUpload,
    doneCreatingProject,
    projectError,
    setProjectId
} from '../reducers/project-state';

import {
    showStandardAlert,
    showAlertWithTimeout
} from '../reducers/alerts';
import {
    openLoadingProject,
    closeLoadingProject
} from '../reducers/modals';
import {
    closeFileMenu
} from '../reducers/menus';
import ITCH_CONFIG from '../../itch.config';

/**
 * SBFileUploader component passes a file input, load handler and props to its child.
 * It expects this child to be a function with the signature
 *     function (renderFileInput, handleLoadProject) {}
 * The component can then be used to attach project loading functionality
 * to any other component:
 *
 * <SBFileUploader>{(className, renderFileInput, handleLoadProject) => (
 *     <MyCoolComponent
 *         className={className}
 *         onClick={handleLoadProject}
 *     >
 *         {renderFileInput()}
 *     </MyCoolComponent>
 * )}</SBFileUploader>
 */

const messages = defineMessages({
    loadError: {
        id: 'gui.projectLoader.loadError',
        defaultMessage: 'The project file that was selected failed to load.',
        description: 'An error that displays when a local project file fails to load.'
    }
});

class SBFileUploader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getProjectTitleFromFilename',
            'renderFileInput',
            'setFileInput',
            'handleChange',
            'handleClick',
            'onload',
            'resetFileInput'
        ]);
    }
    componentWillMount () {
        this.reader = new FileReader();
        this.reader.onload = this.onload;
        this.resetFileInput();
    }
    componentDidUpdate (prevProps) {
        if (this.props.isLoadingUpload && !prevProps.isLoadingUpload && this.fileToUpload && this.reader) {
            this.reader.readAsArrayBuffer(this.fileToUpload);
        }
    }
    componentWillUnmount () {
        this.reader = null;
        this.resetFileInput();
    }
    resetFileInput () {
        this.fileToUpload = null;
        if (this.fileInput) {
            this.fileInput.value = null;
        }
    }
    getProjectTitleFromFilename (fileInputFilename) {
        if (!fileInputFilename) return '';
        // only parse title with valid scratch project extensions
        // (.sb, .sb2, and .sb3)
        const matches = fileInputFilename.match(/^(.*)\.sb[23]?$/);
        if (!matches) return '';
        return matches[1].substring(0, 100); // truncate project title to max 100 chars
    }
    // called when user has finished selecting a file to upload
    handleChange (e) {
        const {
            intl,
            isShowingWithoutId,
            loadingState,
            projectChanged,
            userOwnsProject
        } = this.props;

        const thisFileInput = e.target;
        if (thisFileInput.files) { // Don't attempt to load if no file was selected
            this.fileToUpload = thisFileInput.files[0];
            // If user owns the project, or user has changed the project,
            // we must confirm with the user that they really intend to replace it.
            // (If they don't own the project and haven't changed it, no need to confirm.)
            let uploadAllowed = true;
            if (userOwnsProject || (projectChanged && isShowingWithoutId)) {
                uploadAllowed = confirm( // eslint-disable-line no-alert
                    intl.formatMessage(sharedMessages.replaceProjectWarning)
                );
            }
            if (uploadAllowed) {
                this.props.requestProjectUpload(loadingState);
            } else {
                this.props.closeFileMenu();
            }
        }
    }
    // called when file upload raw data is available in the reader
    onload () {
        if (this.reader) {

            this.props.onLoadingStarted();
            const filename = this.fileToUpload && this.fileToUpload.name;
            this.props.vm.loadProject(this.reader.result)
                .then(() => {
                    this.props.onLoadingFinished(this.props.loadingState, true, this.props.canSave/*, projectId*/);
                    // Reset the file input after project is loaded
                    // This is necessary in case the user wants to reload a project
                    if (filename) {
                        const uploadedProjectTitle = this.getProjectTitleFromFilename(filename);
                        this.props.onReceivedProjectTitle(uploadedProjectTitle);
                    }
                    /*this.props.onShowCreateSuccessAlert();*/
                    this.resetFileInput();
                })
                .catch(error => {
                    log.warn(error);
                    alert(this.props.intl.formatMessage(messages.loadError)); // eslint-disable-line no-alert
                    this.props.onLoadingFinished(this.props.loadingState, this.props.canSave, false);
                    // Reset the file input after project is loaded
                    // This is necessary in case the user wants to reload a project
                    this.resetFileInput();
                });
            /*this.props.vm.loadProject(this.reader.result)
                .then(() => {
                    this.props.onLoadingFinished(this.props.loadingState, true);
                    // Reset the file input after project is loaded
                    // This is necessary in case the user wants to reload a project
                    if (filename) {
                        const uploadedProjectTitle = this.getProjectTitleFromFilename(filename);
                        this.props.onReceivedProjectTitle(uploadedProjectTitle);
                    }
                    this.resetFileInput();
                })
                .catch(error => {
                    log.warn(error);
                    alert(this.props.intl.formatMessage(messages.loadError)); // eslint-disable-line no-alert
                    this.props.onLoadingFinished(this.props.loadingState, false);
                    // Reset the file input after project is loaded
                    // This is necessary in case the user wants to reload a project
                    this.resetFileInput();
                });*/
            // create a new project first
            /*return this.createNewProject().then(response => {
                /!* window.location.hash = `#${response.projectID}`; *!/
                const projectId = response.projectID.toString();
                /!* this.props.onsetProjectId(projectId) *!/
                try { // Can fail e.g. when GUI is loaded from static file (integration tests)
                    //history.replaceState({}, document.title, `${document.location.pathname}${document.location.search}#${projectId}`);
                } catch {
                    // No fallback, just do not trigger promise catch below
                }
            })
                .catch(err => {
                    this.props.onShowAlert('creatingError');
                    this.props.onProjectError(err);
                    this.props.onLoadingFinished(this.props.loadingState, this.props.canSave, false);
                    this.resetFileInput();
                });*/

        }
    }
    createNewProject (){
        const savedVMState = this.props.vm.toJSON();
        const loggedInUser = this.props.loggedInUser;
        let data = {
            project: savedVMState,
            name: 'Untitled',
            user_id: loggedInUser,
            studioID: storage.studioID
        };
        const headers = {
            'Content-Type': 'application/json'
        };
        let isFinalOrStarter = false;
        let projectId = 0;
        if (ITCH_CONFIG.ITCH_LESSONS){
            data = {
                name: 'Untitled',
                courseId: storage.loggedInStudio,
                projectJson: savedVMState
            };
            headers.Authorization = `Bearer ${storage.getToken()}`;
            if (typeof window.getScratchItchConfig === 'function'){
                const configs = window.getScratchItchConfig();
                isFinalOrStarter = configs.isStarter || configs.isFinal;
                projectId = configs.projectId;
            }
        }
        if(isFinalOrStarter || parseInt(projectId.toString()) !== 0) {
            return new Promise((resolve) => {
                resolve({id: projectId, projectID: projectId});
            });
        } else {
            this.props.onShowCreatingAlert();
            const opts = {
                method: 'post',
                url: `${storage.projectHost}project/create`,
                body: JSON.stringify(data),
                // If we set json:true then the body is double-stringified, so don't
                headers
            };
            return new Promise((resolve, reject) => {
                xhr(opts, (err, response) => {
                    if (err) return reject(err);
                    let body;
                    try {
                        // Since we didn't set json: true, we have to parse manually
                        body = JSON.parse(response.body);
                    } catch (e) {
                        return reject(e);
                    }
                    body.id = body['content-name'];
                    resolve(body);
                });
            });
        }

    }
    handleClick () {
        // open filesystem browsing window
        this.fileInput.click();
    }
    setFileInput (input) {
        this.fileInput = input;
    }
    renderFileInput () {
        return (
            <input
                accept=".sb,.sb2,.sb3"
                ref={this.setFileInput}
                style={{display: 'none'}}
                type="file"
                onChange={this.handleChange}
            />
        );
    }
    render () {
        return this.props.children(this.props.className, this.renderFileInput, this.handleClick);
    }
}

SBFileUploader.propTypes = {
    canSave: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    children: PropTypes.func,
    className: PropTypes.string,
    closeFileMenu: PropTypes.func,
    intl: intlShape.isRequired,
    isLoadingUpload: PropTypes.bool,
    isShowingWithoutId: PropTypes.bool,
    loadingState: PropTypes.oneOf(LoadingStates),
    loggedInUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onCreatedProject: PropTypes.func,
    onLoadingFinished: PropTypes.func,
    onLoadingStarted: PropTypes.func,
    onProjectError: PropTypes.func,
    onShowAlert: PropTypes.func,
    onShowCreateSuccessAlert: PropTypes.func,
    onShowCreatingAlert: PropTypes.func,
    onUpdateProjectTitle: PropTypes.func,
    onsetProjectId: PropTypes.func,
    projectChanged: PropTypes.bool,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requestProjectUpload: PropTypes.func,
    onReceivedProjectTitle: PropTypes.func,
    userOwnsProject: PropTypes.bool,
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    })
};
SBFileUploader.defaultProps = {
    className: ''
};
const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const isLoggedIn = state.session.session.user !== null &&
        typeof state.session.session.user !== 'undefined' &&
        Object.keys(state.session.session.user).length > 0 && state.session.session.user.id !== 0;
    return {
        canSave: isLoggedIn,
        isLoadingUpload: getIsLoadingUpload(loadingState),
        isShowingWithoutId: getIsShowingWithoutId(loadingState),
        loadingState: loadingState,
        projectId: state.scratchGui.projectState.projectId,
        projectChanged: state.scratchGui.projectChanged,
        loggedInUser: state.scratchGui.itchProject.editingUser,
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = dispatch => ({
    closeFileMenu: () => dispatch(closeFileMenu()),
    onLoadingFinished: (loadingState, success, canSave) => {
        dispatch(onLoadedProject(loadingState, canSave, success));
        dispatch(closeLoadingProject());
        dispatch(closeFileMenu());
    },
    onCreatedProject: (projectId, loadingState) => dispatch(doneCreatingProject(projectId, loadingState)),
    onShowAlert: alertType => dispatch(showStandardAlert(alertType)),
    onProjectError: error => {
        console.log(error, 'sb-file-uploader');
        return dispatch(projectError(error))
    },
    requestProjectUpload: loadingState => dispatch(requestProjectUpload(loadingState)),
    onShowCreatingAlert: () => showAlertWithTimeout(dispatch, 'creating'),
    onShowCreateSuccessAlert: () => showAlertWithTimeout(dispatch, 'createSuccess'),
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onsetProjectId: projectId => dispatch(setProjectId(projectId)),
    onReceivedProjectTitle: title => dispatch(setProjectTitle(title))
});

// Allow incoming props to override redux-provided props. Used to mock in tests.
const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
    {}, stateProps, dispatchProps, ownProps
);

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(injectIntl(SBFileUploader));
