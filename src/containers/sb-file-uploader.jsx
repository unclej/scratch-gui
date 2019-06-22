import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import xhr from 'xhr';

import analytics from '../lib/analytics';
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
 *     function (renderFileInput, loadProject) {}
 * The component can then be used to attach project loading functionality
 * to any other component:
 *
 * <SBFileUploader>{(renderFileInput, loadProject) => (
 *     <MyCoolComponent
 *         onClick={loadProject}
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
            projectChanged
        } = this.props;

        const thisFileInput = e.target;
        if (thisFileInput.files) { // Don't attempt to load if no file was selected
            this.fileToUpload = thisFileInput.files[0];

            // Allow upload to continue only after confirmation if the project
            // has changed and is not showing with ID. If it has an ID, this operation
            // does not currently overwrite that project, so it is safe to do without confirmation.
            const uploadAllowed = (isShowingWithoutId && projectChanged) ?
                confirm(intl.formatMessage(sharedMessages.replaceProjectWarning)) : // eslint-disable-line no-alert
                true;
            if (uploadAllowed) this.props.requestProjectUpload(loadingState);
        }
    }
    // called when file upload raw data is available in the reader
    onload () {
        if (this.reader) {
            // create a new project first
            return this.createNewProject().then(response => {
                /* window.location.hash = `#${response.projectID}`; */
                const projectId = response.projectID.toString();
                /* this.props.onsetProjectId(projectId) */
                try { // Can fail e.g. when GUI is loaded from static file (integration tests)
                    history.replaceState({}, document.title, `${document.location.pathname}${document.location.search}#${projectId}`);
                } catch {
                    // No fallback, just do not trigger promise catch below
                }
                this.props.onLoadingStarted();
                const filename = this.fileToUpload && this.fileToUpload.name;
                this.props.vm.loadProject(this.reader.result)
                    .then(() => {
                        analytics.event({
                            category: 'project',
                            action: 'Import Project File',
                            nonInteraction: true
                        });
                        // Remove the hash if any (without triggering a hash change event or a reload)

                        this.props.onLoadingFinished(this.props.loadingState, true, this.props.canSave, projectId);
                        // Reset the file input after project is loaded
                        // This is necessary in case the user wants to reload a project
                        if (filename) {
                            const uploadedProjectTitle = this.getProjectTitleFromFilename(filename);
                            this.props.onUpdateProjectTitle(uploadedProjectTitle);
                        }
                        this.props.onShowCreateSuccessAlert();
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
            })
                .catch(err => {
                    this.props.onShowAlert('creatingError');
                    this.props.onProjectError(err);
                    this.props.onLoadingFinished(this.props.loadingState, this.props.canSave, false);
                    this.resetFileInput();
                });

        }
    }
    createNewProject (){
        this.props.onShowCreatingAlert();
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
        if (ITCH_CONFIG.ITCH_LESSONS){
            data = {
                name: 'Untitled',
                courseId: storage.loggedInStudio,
                projectJson: savedVMState
            };
            headers.Authorization = `Bearer ${storage.getToken()}`;
        }
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
    onLoadingFinished: (loadingState, success, canSave, projectId) => {
        dispatch(onLoadedProject(loadingState, canSave, success, projectId));
        dispatch(closeLoadingProject());
        dispatch(closeFileMenu());
    },
    onCreatedProject: (projectId, loadingState) => dispatch(doneCreatingProject(projectId, loadingState)),
    onShowAlert: alertType => dispatch(showStandardAlert(alertType)),
    onProjectError: error => dispatch(projectError(error)),
    requestProjectUpload: loadingState => dispatch(requestProjectUpload(loadingState)),
    onShowCreatingAlert: () => showAlertWithTimeout(dispatch, 'creating'),
    onShowCreateSuccessAlert: () => showAlertWithTimeout(dispatch, 'createSuccess'),
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onsetProjectId: projectId => dispatch(setProjectId(projectId))
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
