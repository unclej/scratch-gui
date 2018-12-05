import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import JSZip from 'jszip';
import storage from '../lib/storage';
import request from 'request';

import {
    showStandardAlert,
    closeStandardAlert
} from '../reducers/alerts';
import {
    autoUpdateProject,
    LoadingStates,
    createProject,
    doneCreatingProject,
    doneUpdatingProject,
    getIsCreating,
    getIsCoping,
    getIsRemixing,
    getIsManualUpdating,
    getIsShowingProject,
    getIsShowingWithoutId,
    getIsUpdating,
    projectError,
    updateProject,
    getIsFromServerUpdate,
    setNeedsUpdate
} from '../reducers/project-state';

import {
    setProjectAssets,
    setProjectJson,
    updatedSuccessfully,
    setThumbnailData
} from '../reducers/project-assets';

/**
 * Higher Order Component to provide behavior for saving projects.
 * @param {React.Component} WrappedComponent the component to add project saving functionality to
 * @returns {React.Component} WrappedComponent with project saving functionality added
 *
 * <ProjectSaverHOC>
 *     <WrappedComponent />
 * </ProjectSaverHOC>
 */
const ProjectSaverHOC = function (WrappedComponent) {
    class ProjectSaverComponent extends React.Component {
        componentDidUpdate (prevProps) {
            const _this = this;
            if (this.props.isUpdating && !prevProps.isUpdating) {
                let openAlertId = 'saveOriginalProject';
                if (!this.props.isServerUpdating){
                    if (this.props.isManualUpdating) {
                        openAlertId = 'saving';
                    }
                    this.props.onOpenALert(openAlertId);
                }
                this.storeProject(this.props.reduxProjectId)
                    .then(data => { // eslint-disable-line no-unused-vars
                        // there is nothing we expect to find in response that we need to check here
                        const thumbnail = this.props.thumbnail;
                        if (thumbnail.content !== thumbnail.updatingContent && thumbnail.updatingContent !== ''){
                            this.saveThumbnail(thumbnail, this.props.isServerUpdating, openAlertId);
                        } else {
                            if (!this.props.isServerUpdating){
                                this.props.onOpenALert('saveSuccess');
                                if (openAlertId === 'saveOriginalProject'){
                                    _this.props.onCloseAlert('saveOriginalProject');
                                }
                                // close alert after 2s
                                setTimeout(() => {
                                    _this.props.onCloseAlert('saveSuccess');
                                }, 2000);
                            }
                            this.props.onSetForUpdate(false);
                            this.props.updatedSuccessfully();
                            this.props.onUpdatedProject(this.props.loadingState);
                        }
                    })
                    .catch(err => {
                        // NOTE: should throw up a notice for user
                        this.props.onProjectError(`Saving the project failed with error: ${err}`);
                    });
            }
            // creating new project
            if (this.props.isCreating && !prevProps.isCreating) {
                this.props.onOpenALert('creating');
                this.storeProject(this.props.reduxProjectId)
                    .then(response => {
                        this.props.onOpenALert('createSuccess');
                        // close alert after 2s
                        setTimeout(() => {
                            _this.props.onCloseAlert('createSuccess');
                        }, 2000);
                        this.props.onCreatedProject(response.id.toString(), this.props.loadingState);
                    })
                    .catch(err => {
                        // NOTE: should throw up a notice for user
                        this.props.onProjectError(`Creating a new project failed with error: ${err}`);
                    });
            }
            // Remix an existing project
            if (getIsRemixing(this.props.loadingState) && !getIsRemixing(prevProps.loadingState)) {
                this.props.onOpenALert('remixing');
                this.remixProject(this.props.reduxProjectId)
                    .then(projectId => {
                        this.props.onOpenALert('remixSuccess');
                        // close alert after 2s
                        setTimeout(() => {
                            _this.props.onCloseAlert('remixSuccess');
                        }, 2000);
                        this.props.onCreatedProject(projectId.toString(), this.props.loadingState);
                        window.location.hash = `#${projectId}`;
                    })
                    .catch(err => {
                        // NOTE: should throw up a notice for user
                        this.props.onProjectError(`Remixing project failed with error: ${err}`);
                    });
            }
            // Create a copy of existing project
            if (getIsCoping(this.props.loadingState) && !getIsCoping(prevProps.loadingState)) {
                this.props.onOpenALert('saveOriginalProject');
                this.copyProject(this.props.reduxProjectId)
                    .then(projectId => {
                        this.props.onOpenALert('copySuccess');
                        // close alert after 2s
                        setTimeout(() => {
                            _this.props.onCloseAlert('copySuccess');
                        }, 2000);
                        this.props.onCreatedProject(projectId.toString(), this.props.loadingState);
                        window.location.hash = `#${projectId}`;
                    })
                    .catch(err => {
                        // NOTE: should throw up a notice for user
                        this.props.onProjectError(`Copy project failed with error: ${err}`);
                    });
            }
            // check if the project state, and user capabilities, have changed so as to indicate
            // that we should create or update project
            //
            // if we're newly able to create this project on the server, create it!
            const showingCreateable = this.props.canCreateNew && this.props.isShowingWithoutId;
            const prevShowingCreateable = prevProps.canCreateNew && prevProps.isShowingWithoutId;
            if (showingCreateable && !prevShowingCreateable) {
                this.props.onCreateProject();
            } else {
                // if we're newly able to save this project, save it!
                const showingSaveable = this.props.canSave && this.props.isShowingWithId;
                const becameAbleToSave = this.props.canSave && !prevProps.canSave;
                if (showingSaveable && becameAbleToSave) {
                    this.props.onUpdateProject();
                }
            }
        }
        /**
         * storeProject:
         * @param  {number|string|undefined} projectId defined value causes PUT/update; undefined causes POST/create
         * @return {Promise} resolves with json object containing project's existing or new id
         */
        storeProject (projectId) {
            const _this = this;
            let {projectName} = this.props;
            projectName = projectName === '' ? 'Untitled' : projectName;
            return this.props.vm.saveProjectSb3()
                .then(content => {
                    const zip = new JSZip();
                    const assetType = storage.AssetType.Project;
                    const dataFormat = storage.DataFormat.SB3;
                    const body = {};
                    body._method = 'put';
                    body.name = projectName;
                    body.user_id = _this.props.loggedInUser;
                    return zip.loadAsync(content).then(contents => {
                        const assetCount = Object.keys(contents.files).length;
                        let processedAsset = 0;
                        const projectAssets = {};
                        const promises = [];
                        const readfile = filename => new Promise(resolve => {
                            zip.file(filename).async('nodebuffer')
                                .then(data => {
                                    if (filename === 'project.json') {
                                        body.project = data.toString();
                                    } else {
                                        projectAssets[filename] = data.toString('base64');
                                    }
                                    return resolve(processedAsset++);
                                });
                        });
                        Object.keys(contents.files).forEach(filename => {
                            promises.push(readfile(filename));
                        });
                        return Promise.all(promises).then(count => {
                            if (count.length === assetCount){
                                return _this.storeAssets(projectAssets)
                                    .then(response => {
                                        if (response){
                                            _this.props.setProjectJson(JSON.parse(body.project));
                                            return storage.store(
                                                assetType,
                                                dataFormat,
                                                JSON.stringify(body),
                                                projectId
                                            );
                                        }
                                    })
                                    .catch(err => {
                                        // NOTE: should throw up a notice for user
                                        this.props.onProjectError(`Update project failed with error: ${err}`);
                                    });
                            }
                        });
                    });
                });
        }
        storeAssets (assets) {
            const _this = this;
            const projectAssets = this.props.projectAssets;
            const assetIds = Object.keys(assets);
            const notSavedAssets = assetIds.filter(val => !projectAssets.includes(val));
            const savedAssets = assetIds.filter(val => projectAssets.includes(val));
            return new Promise((resolve, reject) => {
                if (notSavedAssets.length > 0) {
                    let i = 0;
                    while (i < notSavedAssets.length){
                        const md5 = notSavedAssets[i];
                        i++;
                        const uri = storage.getAssetUpdateConfig(md5);
                        request.post(uri, {
                            form: {
                                content: assets[md5]
                            }
                        },
                        (error, response, b) => {
                            if (error) return reject(error);
                            const assetResponse = JSON.parse(b);
                            if (assetResponse.error){
                                return reject(assetResponse.message);
                            }
                            savedAssets.push(assetResponse.md5);
                            if (savedAssets.length === assetIds.length){
                                _this.props.updateProjectAssets(savedAssets);
                                return resolve(true);
                            }
                        });
                    }
                } else {
                    _this.props.updateProjectAssets(savedAssets);
                    return resolve(true);
                }
            });
        }

        copyProject (projectId) {
            const _this = this;
            // store first existing project
            return this.storeProject(projectId)
                .then(data => new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
                    this.props.onOpenALert('coping');
                    request.post(`${storage.projectHost}project/${projectId}/${storage.loggedInStudio}/copy`, {
                        form: {
                            user_id: storage.loggedInUser
                        }
                    },
                    (error, response, body) => {
                        if (error) {
                            return reject(error);
                        }
                        const resp = JSON.parse(body);
                        if (resp.error) {
                            return reject(resp.message);
                        }
                        return resolve(resp.projectId);
                            
                    });
                }))
                .catch(err => {
                    // NOTE: should throw up a notice for user
                    _this.props.onProjectError(`Saving the project failed with error: ${err}`);
                });
        }

        remixProject (projectId) {
            const _this = this;
            return new Promise((resolve, reject) => {
                request.post(`${storage.projectHost}project/${projectId}/${storage.loggedInStudio}/remix`, {
                    form: {
                        user_id: storage.loggedInUser
                    }
                },
                (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }
                    const resp = JSON.parse(body);
                    if (!resp.error){
                        return resolve(resp.projectId);
                    }
                    return reject(resp.message);
                });
            });
        }
        saveThumbnail (thumbnail, isServerUpdating, openAlertId) {
            const _this = this;
            const uri = storage.getThumbnailUpdateConfig(this.props.reduxProjectId, thumbnail.md5);
            request.post(uri, {
                form: {
                    user_id: storage.loggedInUser,
                    thumbnail: thumbnail.updatingContent
                }
            },
            (error, response, b) => {
                if (!error){
                    const assetResponse = JSON.parse(b);
                    if (!assetResponse.error){
                        if (!isServerUpdating){
                            this.props.onOpenALert('saveSuccess');
                            if (openAlertId === 'saveOriginalProject'){
                                _this.props.onCloseAlert('saveOriginalProject');
                            }
                            // close alert after 2s
                            setTimeout(() => {
                                _this.props.onCloseAlert('saveSuccess');
                            }, 2000);
                        }
                        _this.props.onSetForUpdate(false);
                        _this.props.updatedSuccessfully();
                        _this.props.onUpdatedProject(this.props.loadingState);
                        thumbnail.content = thumbnail.updatingContent;
                        thumbnail.updatingContent = '';
                        thumbnail.md5 = assetResponse.md5;
                        _this.props.onSetThumbnail(thumbnail);
                    }
                }
            });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                isCreating: isCreatingProp,
                isShowingWithId: isShowingWithIdProp,
                isShowingWithoutId: isShowingWithoutIdProp,
                isUpdating: isUpdatingProp,
                loadingState,
                onAutoUpdateProject: onAutoUpdateProjectProp,
                onCreatedProject: onCreatedProjectProp,
                onCreateProject: onCreateProjectProp,
                onProjectError: onProjectErrorProp,
                onUpdatedProject: onUpdatedProjectProp,
                onUpdateProject: onUpdateProjectProp,
                onCloseAlert,
                onOpenALert,
                reduxProjectId,
                projectAssets,
                projectName,
                loggedInUser,
                updateProjectAssets,
                setEditingUserId,
                setRemixProjectId,
                isManualUpdating,
                setProjectJson: setProjectJsonProp,
                updatedSuccessfully: updatedSuccessfullyProp,
                isServerUpdating,
                onSetForUpdate,
                thumbnail,
                onSetThumbnail,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;
            return (
                <WrappedComponent
                    {...componentProps}
                />
            );
        }
    }
    ProjectSaverComponent.propTypes = {
        canCreateNew: PropTypes.bool,
        canSave: PropTypes.bool,
        isCreating: PropTypes.bool,
        isManualUpdating: PropTypes.bool,
        isServerUpdating: PropTypes.bool,
        isShowingWithId: PropTypes.bool,
        isShowingWithoutId: PropTypes.bool,
        isUpdating: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        loggedInUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onAutoUpdateProject: PropTypes.func,
        onCloseAlert: PropTypes.func,
        onCreateProject: PropTypes.func,
        onCreatedProject: PropTypes.func,
        onOpenALert: PropTypes.func,
        onProjectError: PropTypes.func,
        onSetForUpdate: PropTypes.func,
        onSetThumbnail: PropTypes.func,
        onUpdateProject: PropTypes.func,
        onUpdatedProject: PropTypes.func,
        projectAssets: PropTypes.arrayOf(PropTypes.string),
        projectName: PropTypes.string,
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectJson: PropTypes.func,
        thumbnail: PropTypes.objectOf(PropTypes.shape),
        updateProjectAssets: PropTypes.func,
        updatedSuccessfully: PropTypes.func,
        vm: PropTypes.instanceOf(VM).isRequired
    };
    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;
        const projectAssets = state.scratchGui.projectAssets &&
        state.scratchGui.projectAssets.assets ?
            state.scratchGui.projectAssets.assets :
            [];
        return {
            isCreating: getIsCreating(loadingState),
            isShowingWithId: getIsShowingProject(loadingState),
            isShowingWithoutId: getIsShowingWithoutId(loadingState),
            isUpdating: getIsUpdating(loadingState),
            isManualUpdating: getIsManualUpdating(loadingState),
            isServerUpdating: getIsFromServerUpdate(loadingState),
            loadingState: loadingState,
            projectAssets: projectAssets,
            projectName: state.scratchGui.projectTitle,
            reduxProjectId: state.scratchGui.projectState.projectId,
            vm: state.scratchGui.vm,
            thumbnail: state.scratchGui.projectAssets.thumbnail,
            loggedInUser: state.scratchGui.itchProject.editingUser
        };
    };
    const mapDispatchToProps = dispatch => ({
        onAutoUpdateProject: () => dispatch(autoUpdateProject()),
        onCreatedProject: (projectId, loadingState) => dispatch(doneCreatingProject(projectId, loadingState)),
        onCreateProject: () => dispatch(createProject()),
        onProjectError: error => dispatch(projectError(error)),
        onUpdateProject: () => dispatch(updateProject()),
        onUpdatedProject: (projectId, loadingState) => dispatch(doneUpdatingProject(projectId, loadingState)),
        updateProjectAssets: assets => dispatch(setProjectAssets(assets)),
        onOpenALert: alertId => dispatch(showStandardAlert(alertId)),
        onCloseAlert: alertId => dispatch(closeStandardAlert(alertId)),
        setProjectJson: json => dispatch(setProjectJson(json)),
        updatedSuccessfully: () => dispatch(updatedSuccessfully()),
        onSetThumbnail: thumbnail => dispatch(setThumbnailData(thumbnail)),
        onSetForUpdate: update => dispatch(setNeedsUpdate(update))
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(ProjectSaverComponent);
};

export {
    ProjectSaverHOC as default
};
