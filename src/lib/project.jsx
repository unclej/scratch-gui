/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-console */
import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import request from 'request';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import storage from '../lib/storage';
import {
    LoadingStates,
    onSharing,
    getIsSharing,
    getIsShared,
    onShared,
    getIsOpenShareModal
} from '../reducers/itch-project';
import {
    projectError,
    serverAutoUpdateProject,
    setNeedsUpdate,
    getIsFetchingWithId,
    getIsLoadingWithId
} from '../reducers/project-state';
import {
    setProjectName,
    setThumbnailData
} from '../reducers/project-assets';
import {
    openShareProject
} from '../reducers/modals';
import {
    setContent
} from '../reducers/studioLessons';
import ITCH_CONFIG from '../../itch.config';
/* import JSZip from 'jszip'; */
const ItchProject = function (WrappedComponent){
    class Project extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'targetListener',
                'blockListener'
            ]);
            this.targetUpdatingCalled = false;
            this._setProjectForUpdate = false;
            this.targets = [];
            this.targetList = [];
            this.costumeList = {};
            this.assetList = {};
            this.stageTarget = null;
            this.targetUpdating = false;
            this.takeThumbnailIntervalId = null;
            this.props.vm.on('targetsUpdate', this.targetListener);
            this.props.vm.on('BLOCK_DRAG_UPDATE', this.blockListener);
        }
        componentDidUpdate (prevProps) {
            if (getIsSharing(this.props.loadingState) && !getIsSharing(prevProps.loadingState)) {
                if (getIsShared(this.props.loadingState)){
                    this.props.onShareProject();
                } else {
                    this.share(this.props.projectId)
                        .then(url => { // eslint-disable-line no-unused-vars
                            // there is nothing we expect to find in response that we need to check here
                            this.props.onShared(url);
                            this.props.onShareProject();
                            this.props.onShared(url); // reset state to SHARED
                        })
                        .catch(err => {
                            console.log(err);
                            // NOTE: should throw up a notice for user
                            this.props.projectError(`Sharing the project failed with error: ${err}`);
                        });
                }
            }
            if (getIsOpenShareModal(this.props.loadingState) && getIsShared(this.props.loadingState)){
                this.props.onShareProject();
                this.props.onShared(this.props.shareUrl); // reset state to SHARED
            }
            if (this.props.canUpdate && this.props.projectName !== this.props.savedProjectName){
                if (window.self !== window.top && this.props.baseUrl){
                    parent.postMessage(
                        ['projectTitleChanged', [this.props.projectName || 'Untitled']],
                        this.props.baseUrl
                    );
                }
                this.setProjectForUpdate();
            }
            /* if (this.props.canUpdate && this.takeThumbnailIntervalId === null && this.props.thumbnail.md5 === ''){
                this.takeThumbnailIntervalId = setInterval(() => {
                    this.takeThumbnail(true);
                }, 1000);
            } */
            if (this.props.canUpdate &&
                process.env.NODE_ENV === 'production' &&
                typeof window === 'object' &&
                this.props.projectChanged){
                window.onbeforeunload = () => true;
            } else {
                window.onbeforeunload = null;
            }
            if (this.props.isStudent &&
                (
                    (this.props.canUpdate !== prevProps.canUpdate && this.props.activeLessonId !== null) ||
                    (this.props.canUpdate && this.props.activeLessonId !== prevProps.activeLessonId)
                )
            ){
                const lessons = this.props.lessons;
                if (lessons instanceof Array &&
                    lessons.length > 0 &&
                    lessons[this.props.activeLessonId] &&
                    !lessons[this.props.activeLessonId].read
                ){
                    this.markLessonAsRead(lessons[this.props.activeLessonId].id, this.props.activeLessonId);
                }
            }
        }
        setProjectForUpdate (){
            if (!this.props.canUpdate){
                return false;
            }
            const _this = this;
            this.props.onSetForUpdate(true);
            if (!this._setProjectForUpdate){
                this._setProjectForUpdate = true;
                setInterval(() => {
                    _this.checkForUpdates();
                }, 30000);
            }
        }
        share (projectId){
            return new Promise((resolve, reject) => {
                if (!projectId) return reject('No project Id');
                const uri = storage.getShareUrl(projectId);
                const data = ITCH_CONFIG.ITCH_LESSONS ? {
                    form: {},
                    headers: {
                        Authorization: `Bearer ${storage.getToken()}`
                    }
                } : {form: {}};
                request.post(uri,
                    data,
                    (error, response, body) => {
                        const project = JSON.parse(body);
                        if (!project.error && project.hash_link){
                            return resolve(project.hash_link);
                        }
                        return reject('Something goes wrong while we sharing your project');

                    });
            });
        }
        checkForUpdates (){
            if (!this.props.canUpdate){
                return false;
            }
            if (this.props.projectChanged){
                this.props.onSetProjectName(this.props.projectName);
                this.props.autoUpdateProject();
                return;
            }
            if (this.props.projectChanged) {
                const thumbnail = this.props.thumbnail;
                if (thumbnail.content !== thumbnail.updatingContent && thumbnail.updatingContent !== '') {
                    this.saveThumbnail(thumbnail);
                }
            }
        }
        takeThumbnail (directUpdate) {
            if (!this.props.canUpdate){
                return false;
            }
            const mainCanvas = this.props.vm.runtime.renderer.canvas;
            const gl = mainCanvas.getContext('webgl', {
                preserveDrawingBuffer: true
            });
            const c = document.createElement('canvas');
            c.width = mainCanvas.width;
            c.height = mainCanvas.height;
            const ctx = c.getContext('2d');
            ctx.drawImage(gl.canvas, 0, 0);
            const self = this;
            /* ctx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height, 0, 0, c.width, c.height); */
            setTimeout(() => {
                const rgb = self.getAverageRGB(c);
                if (!((rgb.r === 2 || rgb.r === 0) &&
                    (rgb.g === 2 || rgb.g === 0) &&
                    (rgb.b === 2 || rgb.b === 0))){
                    const thumbnail = self.props.thumbnail;
                    thumbnail.updatingContent = c.toDataURL();
                    if (thumbnail.md5 === '' || !thumbnail.md5){
                        const imgData = ctx.getImageData(0, 0, c.width, c.height);
                        const data = imgData.data;
                        const newThumbnail = storage.createAsset(
                            storage.AssetType.ImageBitmap,
                            storage.DataFormat.PNG,
                            new Uint8Array(data),
                            null,
                            true // generate md5
                        );
                        thumbnail.md5 = `${newThumbnail.assetId}_${self.props.projectId}.${storage.DataFormat.PNG}`;
                    }
                    if (directUpdate){
                        self.saveThumbnail(thumbnail);
                    } else {
                        self.props.onSetThumbnail(thumbnail);
                    }
                    if (self.takeThumbnailIntervalId){
                        clearInterval(self.takeThumbnailIntervalId);
                        self.takeThumbnailIntervalId = null;
                    }
                }
            }, 1000);
        }
        blockListener (){
            if (!this.props.canUpdate){
                return false;
            }
            this.setProjectForUpdate();
        }
        targetListener (data){
            const _this = this;
            if (this.targetUpdatingCalled){
                return;
            }
            this.targetUpdatingCalled = true;
            if (!this.props.canUpdate){
                const costumeList = {};
                this.targets = [];
                let assetList = [];
                const assetNameList = {};
                data.targetList.map(target => {
                    costumeList[target.id] = {
                        id: target.id,
                        name: target.name,
                        size: target.size,
                        direction: target.direction,
                        visible: target.visible,
                        x: target.x,
                        y: target.y
                    };
                    assetList = assetList.concat(target.costumes.map(c => {
                        assetNameList[c.md5] = c.name;
                        return c.md5;
                    }), target.sounds.map(s => {
                        assetNameList[s.md5] = s.name;
                        return s.md5;
                    }));
                    return target;
                });
                this.costumeList = costumeList;
                this.assetList = assetNameList;
                assetList = assetList.filter((v, ind, self) => self.indexOf(v) === ind); // get only unique assets
                this.targets = assetList;
                const stage = data.targetList.filter(t => t.isStage);
                if (stage && stage.length > 0){
                    const target = stage[0].costume.assetId || stage[0].id;
                    this.stageTarget = target;
                }
                this.targetUpdatingCalled = false;
                return false;
            }
            const stage = data.targetList.filter(t => t.isStage);
            if (stage && stage.length > 0){
                const target = stage[0].costume.assetId || stage[0].id;
                let assetList = [];
                const costumeList = {};
                let spriteHasChanged = false;
                const assetNameList = {};
                let assetNameHasChanged = false;
                data.targetList.map(t => {
                    if (this.costumeList[t.id]){
                        const sprite = this.costumeList[t.id];
                        if (sprite.name !== t.name ||
                            sprite.size !== t.size ||
                            sprite.direction !== t.direction ||
                            sprite.visible !== t.visible ||
                            sprite.x !== t.x ||
                            sprite.y !== t.y
                        ) {
                            spriteHasChanged = true;
                        }

                    }
                    costumeList[t.id] = {
                        id: t.id,
                        name: t.name,
                        size: t.size,
                        direction: t.direction,
                        visible: t.visible,
                        x: t.x,
                        y: t.y
                    };

                    assetList = assetList.concat(t.costumes.map(c => {
                        if (_this.assetList[c.md5] !== c.name){
                            assetNameHasChanged = true;
                        }
                        assetNameList[c.md5] = c.name;
                        return c.md5;
                    }), t.sounds.map(s => {
                        if (_this.assetList[s.md5] !== s.name){
                            assetNameHasChanged = true;
                        }
                        assetNameList[s.md5] = s.name;
                        return s.md5;
                    }));
                    return t;
                });
                assetList = assetList.filter((v, ind, self) => self.indexOf(v) === ind); // get only unique assets
                if (this.targets.length === assetList.length) {
                    // costume has changed
                    if (spriteHasChanged ||
                        Object.keys(this.costumeList).length !== Object.keys(costumeList).length){
                        this.targets = assetList;
                        this.costumeList = costumeList;
                        this.assetList = assetNameList;
                        this.setProjectForUpdate();
                        /* this.setIntervalToTakeThumbnail(); */
                        this.targetUpdatingCalled = false;
                        return;
                    }
                    // asset has changed
                    if (assetNameHasChanged ||
                        Object.keys(this.assetList).length !== Object.keys(assetNameList).length){
                        this.targets = assetList;
                        this.costumeList = costumeList;
                        this.assetList = assetNameList;
                        this.setProjectForUpdate();
                        /* this.setIntervalToTakeThumbnail(); */
                        this.targetUpdatingCalled = false;
                        return;
                    }
                    const hasDifferentAsset = assetList.filter(c => !this.targets.includes(c));
                    if (hasDifferentAsset.length > 0){
                        this.targets = assetList;
                        this.costumeList = costumeList;
                        this.assetList = assetNameList;
                        this.setProjectForUpdate();
                        /* this.setIntervalToTakeThumbnail(); */
                        this.targetUpdatingCalled = false;
                        return;
                    }
                } else {
                    this.targets = assetList;
                    this.setProjectForUpdate();
                    /* this.setIntervalToTakeThumbnail(); */
                }
                if (target !== this.stageTarget){
                    this.stageTarget = target;
                    /* this.setIntervalToTakeThumbnail(); */
                    this.setStageAsThumbnail(target);
                }
            }
            this.targetUpdatingCalled = false;
        }
        setStageAsThumbnail (assetId){
            const self = this;
            const builtinHelper = this.props.vm.editingTarget.runtime.storage.builtinHelper;
            const asset = builtinHelper.get(assetId);
            if (asset){
                const thumbnail = self.props.thumbnail;
                if (thumbnail.md5 === '' || !thumbnail.md5){
                    const data = asset.data;
                    const newThumbnail = storage.createAsset(
                        storage.AssetType.ImageBitmap,
                        storage.DataFormat.PNG,
                        data,
                        null,
                        true // generate md5
                    );
                    thumbnail.md5 = `${newThumbnail.assetId}_${self.props.projectId}.${storage.DataFormat.PNG}`;
                }
                const src = asset.encodeDataURI();
                const c = document.createElement('canvas');
                const image = new Image();
                image.onload = function () {
                    c.width = image.width;
                    c.height = image.height;
                    const ctx = c.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    thumbnail.updatingContent = c.toDataURL();
                    self.props.onSetThumbnail(thumbnail);
                };
                image.src = src;
            }
        }
        setIntervalToTakeThumbnail (){
            const _this = this;
            if (this.takeThumbnailIntervalId === null){
                this.takeThumbnailIntervalId = setInterval(() => {
                    _this.takeThumbnail(false);
                }, 1000);
            }
        }
        getAverageRGB (canvas) {
            const blockSize = 5;
            // only visit every 5 pixels
            const defaultRGB = {r: 0, g: 0, b: 0};
            // for non-supporting envs
            const context = canvas.getContext && canvas.getContext('2d');
            let data;
            let i = -4;
            const rgb = {r: 0, g: 0, b: 0};
            let count = 0;
            if (!context) {
                return defaultRGB;
            }
            const height = canvas.height;
            const width = canvas.width;

            try {
                data = context.getImageData(0, 0, width, height);
            } catch (e) {
            /* security error, img on diff domain */// alert('x');
                return defaultRGB;
            }

            const length = data.data.length;

            while ((i += blockSize * 4) < length) {
                ++count;
                rgb.r += data.data[i];
                rgb.g += data.data[i + 1];
                rgb.b += data.data[i + 2];
            }

            // ~~ used to floor values
            rgb.r = ~~(rgb.r / count);
            rgb.g = ~~(rgb.g / count);
            rgb.b = ~~(rgb.b / count);

            return rgb;

        }
        saveThumbnail (thumbnail) {
            const _this = this;
            const uri = storage.getThumbnailUpdateConfig(this.props.projectId, thumbnail.md5);
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
                        thumbnail.content = thumbnail.updatingContent;
                        thumbnail.updatingContent = '';
                        thumbnail.md5 = assetResponse.md5;
                        _this.props.onSetThumbnail(thumbnail);
                    }
                }
            });
        }
        markLessonAsRead (lessonId, step){
            const _this = this;
            const uri = storage.getLessonReadUrl(this.props.projectId);
            request.post(uri, {
                form: {
                    user_id: storage.loggedInUser,
                    studio_id: storage.loggedInStudio,
                    lesson_id: lessonId
                }
            },
            error => {
                if (!error){
                    const lessons = _this.props.lessons;
                    lessons[step].read = true;
                    _this.props.setStudioLessonContent(lessons);
                }
            });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                shareUrl,
                loadingState,
                onShared: onSharedProp,
                onSharing: onSharingProp,
                onShareProject,
                projectError: projectErrorProp,
                projectAssets,
                savedJson,
                autoUpdateProject: autoUpdateProjectProp,
                canUpdate,
                savedProjectName,
                projectName,
                onSetProjectName,
                onSetForUpdate,
                projectChanged,
                thumbnail,
                onSetThumbnail,
                baseUrl,
                activeLessonId,
                lessons,
                isStudent,
                setStudioLessonContent,
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
    Project.propTypes = {
        activeLessonId: PropTypes.number,
        assetHost: PropTypes.string,
        autoUpdateProject: PropTypes.func,
        baseUrl: PropTypes.string,
        canUpdate: PropTypes.bool,
        isStudent: PropTypes.bool,
        lessons: PropTypes.arrayOf(PropTypes.shape),
        loadingState: PropTypes.oneOf(LoadingStates),
        onSetForUpdate: PropTypes.func,
        onSetProjectName: PropTypes.func,
        onSetThumbnail: PropTypes.func,
        onShareProject: PropTypes.func,
        onShared: PropTypes.func,
        onSharing: PropTypes.func,
        projectAssets: PropTypes.arrayOf(PropTypes.string),
        projectChanged: PropTypes.bool,
        projectError: PropTypes.func,
        projectHost: PropTypes.string,
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        projectName: PropTypes.string,
        savedJson: PropTypes.string,
        savedProjectName: PropTypes.string,
        setStudioLessonContent: PropTypes.func,
        shareUrl: PropTypes.string,
        thumbnail: PropTypes.objectOf(PropTypes.shape),
        vm: PropTypes.instanceOf(VM)
    };
    const mapStateToProps = state => {
        const projectAssets = state.scratchGui.projectAssets &&
        state.scratchGui.projectAssets.assets ?
            state.scratchGui.projectAssets.assets :
            [];
        const isLoggedIn = state.session.session.user !== null &&
            typeof state.session.session.user !== 'undefined' &&
            Object.keys(state.session.session.user).length > 0;
        const userOwnsProject = state.scratchGui.itchProject.projectUser !== null &&
            typeof state.session.session.user !== 'undefined' &&
            typeof state.session.session.user.id !== 'undefined' &&
            state.session.session.user.id === state.scratchGui.itchProject.projectUser;
        const canUpdate = !state.scratchGui.stageSize.isFullScreen && !state.scratchGui.stageSize.isProjectPage && !(
            getIsFetchingWithId(state.scratchGui.projectState.loadingState) ||
            getIsLoadingWithId(state.scratchGui.projectState.loadingState) ||
            state.scratchGui.modals.loadingProject
        );
        const isStudent = isLoggedIn && typeof state.session.session.user.role !== 'undefined' &&
        state.session.session.user.role === 'student';
        const isSubmitted = state.scratchGui.itchProject.isSubmitted;
        return {
            loadingState: state.scratchGui.itchProject.loadingState,
            projectId: state.scratchGui.projectState.projectId,
            shareUrl: state.scratchGui.itchProject.shareUrl,
            assetHost: state.scratchGui.itchProject.assethost,
            projectHost: state.scratchGui.itchProject.projectHost,
            projectAssets: projectAssets,
            savedJson: JSON.stringify(state.scratchGui.projectAssets.json),
            canUpdate: canUpdate && isLoggedIn && userOwnsProject && !isSubmitted,
            savedProjectName: state.scratchGui.projectAssets.savedProjectName,
            projectName: state.scratchGui.projectTitle,
            vm: state.scratchGui.vm,
            projectChanged: state.scratchGui.projectChanged,
            thumbnail: state.scratchGui.projectAssets.thumbnail,
            baseUrl: state.scratchGui.itchProject.baseUrl,
            lessons: state.scratchGui.studioLessons.content,
            activeLessonId: state.scratchGui.studioLessons.step,
            isStudent
        };
    };
    const mapDispatchToProps = dispatch => ({
        onShared: url => dispatch(onShared(url)),
        onSharing: (projectId, loadingState) => dispatch(onSharing(projectId, loadingState)),
        onShareProject: () => dispatch(openShareProject()),
        autoUpdateProject: () => dispatch(serverAutoUpdateProject()),
        projectError: errStr => {
            console.log(errStr, 'project');
            return dispatch(projectError(errStr));
        },
        onSetProjectName: name => dispatch(setProjectName(name)),
        onSetForUpdate: update => dispatch(setNeedsUpdate(update)),
        onSetThumbnail: thumbnail => dispatch(setThumbnailData(thumbnail)),
        setStudioLessonContent: content => dispatch(setContent(content))
    });
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Project);
};
export default ItchProject;
