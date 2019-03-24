import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import xhr from 'xhr';

import log from '../lib/log';
import storage from '../lib/storage';
import dataURItoBlob from '../lib/data-uri-to-blob';

import {
    showAlertWithTimeout,
    showStandardAlert
} from '../reducers/alerts';
import {setAutoSaveTimeoutId} from '../reducers/timeout';
import {setProjectUnchanged} from '../reducers/project-changed';
import JSZip from 'jszip';
import request from 'request';

import {
    autoUpdateProject,
    LoadingStates,
    createProject,
    doneCreatingProject,
    doneUpdatingProject,
    getIsAnyCreatingNewState,
    getIsCreatingCopy,
    getIsCreatingNew,
    getIsManualUpdating,
    getIsRemixing,
    getIsShowingWithId,
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
        constructor (props) {
            super(props);
            bindAll(this, [
                'leavePageConfirm',
                'tryToAutoSave'
            ]);
        }
        componentWillMount () {
            if (typeof window === 'object') {
                // Note: it might be better to use a listener instead of assigning onbeforeunload;
                // but then it'd be hard to turn this listening off in our tests
                window.onbeforeunload = e => this.leavePageConfirm(e);
            }
        }
        componentDidUpdate (prevProps) {
            if (this.props.projectChanged && !prevProps.projectChanged) {
                this.scheduleAutoSave();
            }
            if (this.props.isUpdating && !prevProps.isUpdating) {
                this.updateProjectToStorage();
            }
            if (this.props.isCreatingNew && !prevProps.isCreatingNew) {
                this.createNewProjectToStorage();
            }
            if (this.props.isCreatingCopy && !prevProps.isCreatingCopy) {
                this.createCopyToStorage();
            }
            if (this.props.isRemixing && !prevProps.isRemixing) {
                this.props.onRemixing(true);
                this.createRemixToStorage();
            } else if (!this.props.isRemixing && prevProps.isRemixing) {
                this.props.onRemixing(false);
            }
            /****
             * OLD CODE START
             */
            /* const _this = this;
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
                        this.props.onCreatedProject(response.projectID.toString(), this.props.loadingState);
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
            if (getIsCreatingCopy(this.props.loadingState) && !getIsCreatingCopy(prevProps.loadingState)) {
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
            } */
            /**
             * OLD CODE END
             */

             
            // see if we should "create" the current project on the server
            // check if the project state, and user capabilities, have changed so as to indicate
            // that we should create or update project
            //
            // don't try to create or save immediately after trying to create
            if (prevProps.isCreatingNew) return;
            // if we're newly able to create this project, create it!
            if (this.isShowingCreatable(this.props) && !this.isShowingCreatable(prevProps)) {
                this.props.onCreateProject();
            }

            // see if we should save/update the current project on the server
            //
            // don't try to save immediately after trying to save
            if (prevProps.isUpdating) return;
            // if we're newly able to save this project, save it!
            const becameAbleToSave = this.props.canSave && !prevProps.canSave;
            const becameShared = this.props.isShared && !prevProps.isShared;
            if (this.props.isShowingSaveable && (becameAbleToSave || becameShared)) {
                this.props.onAutoUpdateProject();
            }
        }
        componentWillUnmount () {
            this.clearAutoSaveTimeout();
            // Cant unset the beforeunload because it might no longer belong to this component
            // i.e. if another of this component has been mounted before this one gets unmounted
            // which happens when going from project to editor view.
            // window.onbeforeunload = undefined; // eslint-disable-line no-undefined
        }
        leavePageConfirm (e) {
            if (this.props.projectChanged) {
                // both methods of returning a value may be necessary for browser compatibility
                (e || window.event).returnValue = true;
                return true;
            }
            return; // Returning undefined prevents the prompt from coming up
        }
        clearAutoSaveTimeout () {
            if (this.props.autoSaveTimeoutId !== null) {
                clearTimeout(this.props.autoSaveTimeoutId);
                this.props.setAutoSaveTimeoutId(null);
            }
        }
        scheduleAutoSave () {
            if (this.props.isShowingSaveable && this.props.autoSaveTimeoutId === null) {
                const timeoutId = setTimeout(this.tryToAutoSave,
                    this.props.autoSaveIntervalSecs * 1000);
                this.props.setAutoSaveTimeoutId(timeoutId);
            }
        }
        tryToAutoSave () {
            if (this.props.projectChanged && this.props.isShowingSaveable) {
                this.props.onAutoUpdateProject();
            }
        }
        isShowingCreatable (props) {
            return props.canCreateNew && props.isShowingWithoutId;
        }
        updateProjectToStorage () {
            this.props.onShowSavingAlert();
            return this.storeProject(this.props.reduxProjectId)
                .then(() => {
                    // there's an http response object available here, but we don't need to examine
                    // it, because there are no values contained in it that we care about
                    this.props.onUpdatedProject(this.props.loadingState);
                    this.props.onShowSaveSuccessAlert();
                })
                .catch(err => {
                    // Always show the savingError alert because it gives the
                    // user the chance to download or retry the save manually.
                    this.props.onShowAlert('savingError');
                    this.props.onProjectError(err);
                });
        }
        createNewProjectToStorage () {
            return this.storeProject(null)
                .then(response => {
                    window.location.hash = `#${response.projectID}`;
                    this.props.onCreatedProject(response.projectID.toString(), this.props.loadingState);
                })
                .catch(err => {
                    this.props.onShowAlert('creatingError');
                    this.props.onProjectError(err);
                });
        }
        createCopyToStorage () {
            this.props.onShowCreatingCopyAlert();
            return this.storeProject(null, null, `${this.props.reduxProjectId}/${storage.loggedInStudio}/copy`)
                .then(response => {
                    window.location.hash = `#${response.projectID}`;
                    this.props.onCreatedProject(response.projectID.toString(), this.props.loadingState);
                    this.props.onShowCopySuccessAlert();
                })
                .catch(err => {
                    this.props.onShowAlert('creatingError');
                    /* this.props.onProjectError(err); */
                });
        }
        createRemixToStorage () {
            this.props.onShowCreatingRemixAlert();
            return this.storeProject(null,null, `${this.props.reduxProjectId}/${storage.loggedInStudio}/remix`)
                .then(response => {
                    window.location.hash = `#${response.projectID}`;
                    this.props.onCreatedProject(response.projectID.toString(), this.props.loadingState);
                    this.props.onShowRemixSuccessAlert();
                })
                .catch(err => {
                    this.props.onShowAlert('creatingError');
                    /* this.props.onProjectError(err); */
                });
        }
        /**
         * storeProject:
         * @param  {number|string|undefined} projectId - defined value will PUT/update; undefined/null will POST/create
         * @return {Promise} - resolves with json object containing project's existing or new id
         * @param {?object} requestParams - object of params to add to request body
         */
        storeProject (projectId, requestParams, url) {
            requestParams = requestParams || {};
            this.clearAutoSaveTimeout();
            // Serialize VM state now before embarking on
            // the asynchronous journey of storing assets to
            // the server. This ensures that assets don't update
            // while in the process of saving a project (e.g. the
            // serialized project refers to a newer asset than what
            // we just finished saving).
            const savedVMState = this.props.vm.toJSON();
            const projectName = this.props.reduxProjectTitle;
            const loggedInUser = this.props.loggedInUser;
            return Promise.all(this.props.vm.assets
                .filter(asset => !asset.clean)
                .map(
                    asset => storage.store(
                        asset.assetType,
                        asset.dataFormat,
                        asset.data,
                        asset.assetId
                    ).then(
                        () => (asset.clean = true)
                    )
                )
            ).then(() => {
                const opts = {
                    body: JSON.stringify({project:savedVMState, name: projectName, user_id: loggedInUser}),
                    // If we set json:true then the body is double-stringified, so don't
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                };
                const creatingProject = projectId === null || typeof projectId === 'undefined';
                let qs = queryString.stringify(requestParams);
                if (qs) qs = `?${qs}`;
                if (creatingProject) {
                    if(url){
                        Object.assign(opts, {
                            method: 'post',
                            url: `${storage.projectHost}project/${url}`
                        });
                    }else{
                        Object.assign(opts, {
                            method: 'post',
                            url: `${storage.projectHost}project/create/${qs}`
                        });
                    }
                    
                } else {
                    Object.assign(opts, {
                        method: 'put',
                        url: `${storage.projectHost}project/${projectId}/update${qs}`
                    });
                }
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
                        body.id = projectId;
                        if (creatingProject) {
                            body.id = body['content-name'];
                        }
                        resolve(body);
                    });
                });
            })
                .then(response => {
                    if(response.error === false){
                        this.props.onSetProjectUnchanged();
                        const id = response.projectID.toString();
                        if (id && this.props.onUpdateProjectThumbnail) {
                            this.storeProjectThumbnail(id);
                        }
                        return response;
                    } else{
                        throw response.message;
                    }
                    
                })
                .catch(err => {
                    log.error(err);
                    throw err; // pass the error up the chain
                });
        }

        /**
         * Store a snapshot of the project once it has been saved/created.
         * Needs to happen _after_ save because the project must have an ID.
         * @param {!string} projectId - id of the project, must be defined.
         */
        storeProjectThumbnail (projectId) {
            try {
                this.props.vm.postIOData('video', {forceTransparentPreview: true});
                this.props.vm.renderer.requestSnapshot(dataURI => {
                    this.props.vm.postIOData('video', {forceTransparentPreview: false});
                    this.props.onUpdateProjectThumbnail(
                        projectId, dataURItoBlob(dataURI));
                });
                this.props.vm.renderer.draw();
            } catch (e) {
                log.error('Project thumbnail save error', e);
                // This is intentionally fire/forget because a failure
                // to save the thumbnail is not vitally important to the user.
            }
        }
        /****
         * OLD CODE START
         */
        /* storeProject (projectId) {
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
        } */
        /****
         * OLD CODE END
         */
        render () {
            const {
                /* eslint-disable no-unused-vars */
                autoSaveTimeoutId,
                autoSaveIntervalSecs,
                isCreatingCopy,
                isCreatingNew,
                projectChanged,
                isAnyCreatingNewState,
                isManualUpdating,
                isRemixing,
                isShowingSaveable,
                isShowingWithId,
                isShowingWithoutId,
                isUpdating,
                loadingState,
                onAutoUpdateProject,
                onCreatedProject,
                onCreateProject,
                onProjectError,
                onRemixing,
                onSetProjectUnchanged,
                onShowAlert,
                onShowCopySuccessAlert,
                onShowRemixSuccessAlert,
                onShowCreatingCopyAlert,
                onShowCreatingRemixAlert,
                onShowSaveSuccessAlert,
                onShowSavingAlert,
                onUpdatedProject,
                onUpdateProjectThumbnail,
                reduxProjectId,
                reduxProjectTitle,
                setAutoSaveTimeoutId: setAutoSaveTimeoutIdProp,
                onUpdateProject: onUpdateProjectProp,
                /* onCloseAlert, */
                onOpenALert,
                projectAssets,
                projectName,
                loggedInUser,
                updateProjectAssets,
                setEditingUserId,
                setRemixProjectId,
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
                    isCreating={isAnyCreatingNewState}
                    {...componentProps}
                />
            );
        }
    }

    ProjectSaverComponent.propTypes = {
        autoSaveTimeoutId: PropTypes.number,
        canCreateNew: PropTypes.bool,
        canSave: PropTypes.bool,
        isAnyCreatingNewState: PropTypes.bool,
        isCreatingCopy: PropTypes.bool,
        isCreatingNew: PropTypes.bool,
        isManualUpdating: PropTypes.bool,
        isRemixing: PropTypes.bool,
        isShared: PropTypes.bool,
        isShowingSaveable: PropTypes.bool,
        isCreating: PropTypes.bool,
        isServerUpdating: PropTypes.bool,
        isShowingWithId: PropTypes.bool,
        isShowingWithoutId: PropTypes.bool,
        isUpdating: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        onAutoUpdateProject: PropTypes.func,
        loggedInUser: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /* onCloseAlert: PropTypes.func, */
        onCreateProject: PropTypes.func,
        onCreatedProject: PropTypes.func,
        onOpenALert: PropTypes.func,
        onProjectError: PropTypes.func,
        onRemixing: PropTypes.func,
        onShowAlert: PropTypes.func,
        onShowCopySuccessAlert: PropTypes.func,
        onShowCreatingCopyAlert: PropTypes.func,
        onShowCreatingRemixAlert: PropTypes.func,
        onShowRemixSuccessAlert: PropTypes.func,
        onShowSaveSuccessAlert: PropTypes.func,
        onShowSavingAlert: PropTypes.func,
        onUpdateProjectThumbnail: PropTypes.func,
        onUpdatedProject: PropTypes.func,
        projectChanged: PropTypes.bool,
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        reduxProjectTitle: PropTypes.string,
        onSetForUpdate: PropTypes.func,
        onSetThumbnail: PropTypes.func,
        onUpdateProject: PropTypes.func,
        projectAssets: PropTypes.arrayOf(PropTypes.string),
        projectName: PropTypes.string,
        setProjectJson: PropTypes.func,
        thumbnail: PropTypes.objectOf(PropTypes.shape),
        updateProjectAssets: PropTypes.func,
        updatedSuccessfully: PropTypes.func,
        vm: PropTypes.instanceOf(VM).isRequired
    };
    ProjectSaverComponent.defaultProps = {
        autoSaveIntervalSecs: 60,
        onRemixing: () => {}
    };
    const mapStateToProps = (state, ownProps) => {
        const loadingState = state.scratchGui.projectState.loadingState;
        const isShowingWithId = getIsShowingWithId(loadingState);
        const projectAssets = state.scratchGui.projectAssets &&
        state.scratchGui.projectAssets.assets ?
            state.scratchGui.projectAssets.assets :
            [];
        return {
            autoSaveTimeoutId: state.scratchGui.timeout.autoSaveTimeoutId,
            isAnyCreatingNewState: getIsAnyCreatingNewState(loadingState),
            isCreatingCopy: getIsCreatingCopy(loadingState),
            isCreatingNew: getIsCreatingNew(loadingState),
            isRemixing: getIsRemixing(loadingState),
            isShowingSaveable: ownProps.canSave && isShowingWithId,
            isShowingWithId: isShowingWithId,
            isShowingWithoutId: getIsShowingWithoutId(loadingState),
            isUpdating: getIsUpdating(loadingState),
            isManualUpdating: getIsManualUpdating(loadingState),
            loadingState: loadingState,
            projectChanged: state.scratchGui.projectChanged,
            reduxProjectId: state.scratchGui.projectState.projectId,
            reduxProjectTitle: state.scratchGui.projectTitle,
            isServerUpdating: getIsFromServerUpdate(loadingState),
            projectAssets: projectAssets,
            projectName: state.scratchGui.projectTitle,
            thumbnail: state.scratchGui.projectAssets.thumbnail,
            loggedInUser: state.scratchGui.itchProject.editingUser,
            vm: state.scratchGui.vm
        };
    };
    const mapDispatchToProps = dispatch => ({
        onAutoUpdateProject: () => dispatch(autoUpdateProject()),
        onCreatedProject: (projectId, loadingState) => dispatch(doneCreatingProject(projectId, loadingState)),
        onCreateProject: () => dispatch(createProject()),
        onProjectError: error => dispatch(projectError(error)),
        onSetProjectUnchanged: () => dispatch(setProjectUnchanged()),
        onShowAlert: alertType => dispatch(showStandardAlert(alertType)),
        onShowCopySuccessAlert: () => showAlertWithTimeout(dispatch, 'createCopySuccess'),
        onShowRemixSuccessAlert: () => showAlertWithTimeout(dispatch, 'createRemixSuccess'),
        onShowCreatingCopyAlert: () => showAlertWithTimeout(dispatch, 'creatingCopy'),
        onShowCreatingRemixAlert: () => showAlertWithTimeout(dispatch, 'creatingRemix'),
        onShowSaveSuccessAlert: () => showAlertWithTimeout(dispatch, 'saveSuccess'),
        onShowSavingAlert: () => showAlertWithTimeout(dispatch, 'saving'),
        onUpdatedProject: (projectId, loadingState) => dispatch(doneUpdatingProject(projectId, loadingState)),
        setAutoSaveTimeoutId: id => dispatch(setAutoSaveTimeoutId(id)),
        onUpdateProject: () => dispatch(updateProject()),
        updateProjectAssets: assets => dispatch(setProjectAssets(assets)),
        onOpenALert: alertId => dispatch(showStandardAlert(alertId)),/* 
        onCloseAlert: alertId => dispatch(closeStandardAlert(alertId)), */
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
