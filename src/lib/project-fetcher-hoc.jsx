import React from 'react';
import PropTypes from 'prop-types';
import {intlShape, injectIntl} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import { TextDecoder } from 'text-encoding';
if (!window['TextDecoder']) {
    window['TextDecoder'] = TextDecoder;
}

import {setProjectUnchanged} from '../reducers/project-changed';
import {
    LoadingStates,
    getIsCreatingNew,
    getIsFetchingWithId,
    getIsLoading,
    getIsShowingProject,
    onFetchedProjectData,
    projectError,
    setProjectId,
    getIsShowingWithoutId
} from '../reducers/project-state';
import {
    activateTab,
    BLOCKS_TAB_INDEX
} from '../reducers/editor-tab';

import {
    setProjectAssets,
    resetToInitial
} from '../reducers/project-assets';

import log from './log';
import storage from './storage';
import request from 'request';
import ITCH_CONFIG from '../../itch.config';
import {updateSession} from '../reducers/session';
import {setProjectTitle} from '../reducers/project-title';
import {
    setProjectData,
    onShared,
    setRemixProjectId,
    setEditingUserId,
    setStudioId,
    setAssetHost,
    setBaseUrl,
    setCsrfToken,
    setProjectHost
} from '../reducers/itch-project';
import {selectLocale} from '../reducers/locales';
import {
    openProjectLessons
} from '../reducers/modals';
import {setContent, activateLesson, closeLessons} from '../reducers/studioLessons';
/* Higher Order Component to provide behavior for loading projects by id. If
 * there's no id, the default project is loaded.
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectFetcherHOC = function (WrappedComponent) {
    class ProjectFetcherComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'fetchProject'
            ]);
            this.PROJECT_SERVER = ITCH_CONFIG.PROJECT_SERVER;
            this.URL_PARAMS = {};
            this.getConfigs();
            if (ITCH_CONFIG.ITCH_LESSONS) {
                this.setConfigItchLessons(props);
            } else {
                this.setConfigs(props);
            }
            storage.setTranslatorFunction(props.intl.formatMessage);
            // props.projectId might be unset, in which case we use our default;
            // or it may be set by an even higher HOC, and passed to us.
            // Either way, we now know what the initial projectId should be, so
            // set it in the redux store.
            if (
                props.projectId !== '' &&
                    props.projectId !== null &&
                    typeof props.projectId !== 'undefined'
            ) {
                this.props.setProjectId(props.projectId.toString());
            }
        }
        componentDidUpdate (prevProps) {
            if (prevProps.projectHost !== this.props.projectHost) {
                storage.setProjectHost(this.props.projectHost);
            }
            if (prevProps.assetHost !== this.props.assetHost) {
                storage.setAssetHost(this.props.assetHost);
            }
            if ((this.props.isFetchingWithId && !prevProps.isFetchingWithId && !prevProps.isFetchingWithoutId) || (this.props.isFetchingWithId && prevProps.isFetchingWithoutId)) {
                this.fetchProject(this.props.reduxProjectId, this.props.loadingState);
            }
            if (this.props.isShowingProject && !prevProps.isShowingProject) {
                this.props.onProjectUnchanged();
            }
            if (this.props.isShowingProject && (prevProps.isLoadingProject || prevProps.isCreatingNew)) {
                this.props.onActivateTab(BLOCKS_TAB_INDEX);
            }
        }
        setConfigItchLessons (props) {
            if(typeof window.getScratchItchConfig === 'function') {
                const configs = window.getScratchItchConfig();
                const loggedInUserId = 0;
                storage.setLoggedInUser(loggedInUserId);
                this.props.setEditingUserId(loggedInUserId);
                this.props.setStudioId(configs.courseId);
                storage.setLoggedInStudioId(configs.courseId);
                storage.setToken(configs.token);
                this.props.setCsrfToken(configs.token);
                this.props.setAssetHost(configs.assetHost);
                storage.setAssetHost(configs.assetHost);
                this.props.setProjectHost(configs.projectHost);
                storage.setProjectHost(configs.projectHost);
                if (configs.starterProjectId) {
                    storage.setStarterProjectId(configs.starterProjectId);
                }
            } else {
                let loggedInUserId = 0;
                let loggedInStudioId = 0;
                storage.setLoggedInUser(loggedInUserId);
                this.props.setEditingUserId(loggedInUserId);
                this.props.setStudioId(loggedInStudioId);
                storage.setLoggedInStudioId(loggedInStudioId);
                this.props.setAssetHost(props.assetHost);
                storage.setAssetHost(props.assetHost);
                const projectHost = this.PROJECT_SERVER ? this.PROJECT_SERVER : props.projectHost;
                this.props.setProjectHost(projectHost);
                storage.setProjectHost(projectHost);
            }

        }
        setConfigs (props) {
            let loggedInUserId = 0;
            let loggedInStudioId = 0;
            // set configs
            if (this.fetchRemixProjectId() !== 0){
                this.props.setRemixProjectId(this.fetchRemixProjectId());
            }
            if (this.fetchUserId() !== 0){
                loggedInUserId = this.fetchUserId();
            }
            storage.setLoggedInUser(loggedInUserId);
            this.props.setEditingUserId(loggedInUserId);
            if (this.fetchStudioId() !== 0){
                loggedInStudioId = this.fetchStudioId();
            }
            this.props.setStudioId(loggedInStudioId);
            storage.setLoggedInStudioId(loggedInStudioId);

            if (this.fetchCsrfToken() !== ''){
                this.props.setCsrfToken(this.fetchCsrfToken());
            }
            if (this.fetchAssetUrl() === ''){
                this.props.setAssetHost(props.assetHost);
                storage.setAssetHost(props.assetHost);
            } else {
                storage.setAssetHost(this.fetchAssetUrl());
                this.props.setAssetHost(this.fetchAssetUrl());
            }
            if (this.fetchApiUrl() === ''){
                const projectHost = this.PROJECT_SERVER ? this.PROJECT_SERVER : props.projectHost;
                this.props.setProjectHost(projectHost);
                storage.setProjectHost(projectHost);
            } else {
                storage.setProjectHost(this.fetchApiUrl());
                this.props.setProjectHost(this.fetchApiUrl());
            }
            if (this.fetchBaseUrl() !== ''){
                this.props.setBaseUrl(this.fetchBaseUrl());
            }
        }
        getConfigs (){
            const url = window.location.search.substring(1).split('&');
            const keyValue = {};
            for (let i = 0; i < url.length; i++){
                const d = url[i].split('=');
                keyValue[d[0]] = d[1];
            }
            this.URL_PARAMS = keyValue;
            this.PROJECT_SERVER = this.URL_PARAMS.apiUrl ?
                (`${this.URL_PARAMS.apiUrl}`) :
                ITCH_CONFIG.PROJECT_SERVER;
        }
        fetchRemixProjectId (){
            return this.URL_PARAMS.remix_of ? this.URL_PARAMS.remix_of : 0;
        }
        fetchUserId (){
            return this.URL_PARAMS.user_id ? 1 * this.URL_PARAMS.user_id : 0;
        }
        fetchStudioId (){
            return this.URL_PARAMS.studioID ? this.URL_PARAMS.studioID : 0;
        }
        fetchCsrfToken (){
            return this.URL_PARAMS.csrf_token ? this.URL_PARAMS.csrf_token : '';
        }
        fetchAssetUrl (){
            return this.URL_PARAMS.assetsUrl ? this.URL_PARAMS.assetsUrl : '';
        }
        fetchApiUrl (){
            return this.URL_PARAMS.apiUrl ? this.URL_PARAMS.apiUrl : '';
        }
        fetchBaseUrl (){
            return this.URL_PARAMS.baseUrl ? this.URL_PARAMS.baseUrl : '';
        }
        fetchProject (projectId, loadingState){
            if (1 * projectId === 0){
                storage
                    .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
                    .then(projectAsset => {
                        if (this.props.isLoggedIn){
                            if (ITCH_CONFIG.ITCH_LESSONS){
                                // this.createItchLessonProject(this, projectAsset);
                                this.props.onFetchedProjectData(projectAsset.data, loadingState);
                            } else {
                                this.createItchProject(this, projectAsset);
                            }
                        } else if (projectAsset) {
                            this.props.onFetchedProjectData(projectAsset.data, loadingState);
                        } else {
                            // Treat failure to load as an error
                            // Throw to be caught by catch later on
                            throw new Error('Could not find project');
                        }


                    })
                    .catch(err => log.error(err));
            } else {
                request.get(`${ITCH_CONFIG.ASSET_SERVER}/crossdomain.xml`, {mode: 'no-cors'},
                    () => {
                    });
                storage
                    .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
                    .then(projectAsset => {
                        const projectData = JSON.parse(new TextDecoder().decode(projectAsset.data));
                        // check language
                        if (projectData.language){
                            const newLocale = projectData.language;
                            if (newLocale !== 'en' && this.props.supportedLocales.includes(newLocale)){
                                this.props.onChangeLanguage(newLocale);
                                document.documentElement.lang = newLocale;
                            }
                        }
                        const project = projectData.project;
                        const user = projectData.user;
                        const shareUrl = projectData.hash_link;
                        this.props.setSession({user});
                        this.props.setProjectTitle((project.name === 'Untitled') ? '' : project.name);
                        const isSubmitted = (project.submit_of && project.submit_of !== 0);
                        this.props.setProjectData(
                            project.id,
                            project.user_id,
                            this.props.projectHost,
                            this.props.assetHost,
                            projectData.lessons || [],
                            isSubmitted
                        );
                        this.props.setProjectId(project.id);
                        if (shareUrl && shareUrl !== ''){
                            this.props.setShareUrl(shareUrl);
                        } else {
                            this.props.setShareUrl(null);
                        }
                        // check if project has lessons
                        if (
                            projectData.lessons &&
                            projectData.lessons instanceof Array &&
                            projectData.lessons.length > 0
                        ){
                            this.props.setStudioLessonsContent(projectData.lessons);
                            this.props.showLessons(0, null);
                            if(this.props.isTeacherPreview) {
                                this.props.hideLessons();
                            }
                            // this.props.onProjectLessons();
                        } else {
                            this.props.setStudioLessonsContent([]);
                        }
                        let projectJson;
                        if (typeof project.json !== 'undefined' && typeof project.json !== 'object'){
                            projectJson = JSON.parse(project.json);
                        } else {
                            projectJson = project.json;
                        }
                        this.props.resetToInitial(projectJson, project.name, project.thumbnail);
                        if (typeof projectJson.targets !== 'undefined'){
                            for (let i = 0; i < projectJson.targets.length; i++){
                                if (
                                    typeof projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'] !==
                                    'undefined' &&
                                    projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'].type === ''){
                                    delete projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'];
                                }
                            }
                            this.storeAssets(projectJson.targets);
                        }
                        project.json = JSON.stringify(projectJson);
                        const projectNameTextInput = document.getElementById('projectNameTextInput');
                        if (projectNameTextInput){
                            projectNameTextInput.value = (project.name === 'Untitled') ? '' : project.name;
                        }
                        if (project.json) {
                            this.props.onFetchedProjectData(project.json, loadingState);
                        }
                    })
                    /* .then(() => {
                        if (projectId !== 0) {
                            analytics.event({
                                category: 'project',
                                action: 'Load Project',
                                value: projectId,
                                nonInteraction: true
                            });
                        }
                    }) */
                    .catch(err => log.error(err));
            }
        }
        createItchProject (self, projectAsset){
            request.post(`${self.PROJECT_SERVER}project/create`,
                {form: {
                    name: 'Untitled',
                    remix_of: self.fetchRemixProjectId(),
                    user_id: self.fetchUserId(),
                    studioID: self.fetchStudioId(),
                    project_json: projectAsset.data
                }},
                (error, response, body) => {
                    const project = JSON.parse(body);
                    if (project.error){
                        log.error('There was a problem with creating new project');
                    } else {
                        if (!ITCH_CONFIG.ITCH_LESSONS){
                            window.location.hash = `#${project.projectID}`;
                        }
                        self.props.setProjectId(project.projectID);
                        self.fetchProject(project.projectID, 'FETCHING_WITH_ID');
                    }
                });
        }
        createItchLessonProject (self, projectAsset){
            const data = {
                name: 'Untitled',
                courseId: storage.loggedInStudio,
                projectJson: projectAsset.data
            };
            if (storage.starterProjectId){
                data.remixOf = storage.starterProjectId;
            }
            request.post(`${self.PROJECT_SERVER}project/create`,
                {
                    json: data,
                    headers: {
                        Authorization: `Bearer ${storage.getToken()}`
                    }
                },
                (error, response, body) => {
                    const project = body;
                    if (project.error){
                        log.error('There was a problem with creating new project');
                    } else {
                        self.props.setProjectId(project.projectID);
                        self.fetchProject(project.projectID, 'FETCHING_WITH_ID');
                    }
                });
        }
        storeAssets (targets) {
            let assets = [];
            for (let i = 0; i < targets.length; i++){
                const target = targets[i];
                assets = assets.concat(target.costumes.map(costume => `${costume.assetId}.${costume.dataFormat}`));
                assets = assets.concat(target.sounds.map(sound => `${sound.assetId}.${sound.dataFormat}`));
                if ((i + 1) === targets.length){
                    assets = assets.filter((a, ind, self) => self.indexOf(a) === ind);
                    this.props.updateProjectAssets(assets);
                }
            }
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                assetHost,
                intl,
                isLoadingProject: isLoadingProjectProp,
                loadingState,
                onActivateTab,
                onError: onErrorProp,
                onFetchedProjectData: onFetchedProjectDataProp,
                onProjectUnchanged,
                projectHost,
                projectId,
                reduxProjectId,
                setProjectId: setProjectIdProp,
                setSession,
                updateProjectAssets: updateProjectAssetsProp,
                isFetchingWithoutId: isFetchingWithoutIdProp,
                setProjectTitle: setProjectTitleProp,
                setProjectData: setProjectDataProp,
                setShareUrl: setShareUrlProp,
                setStudioId: setStudioIdProp,
                setAssetHost: setAssetHostProp,
                setBaseUrl: setBaseUrlProp,
                setCsrfToken: setsetCsrfTokenProp,
                setProjectHost: setProjectHostProp,
                onProjectLessons,
                setStudioLessonsContent,
                showLessons: showLessonsProp,
                hideLessons: hideLessonsProp,
                isTeacherPreview: isTeacherPreviewProp,
                resetToInitial: resetToInitialProp,
                onChangeLanguage: onChangeLanguageProp,
                supportedLocales: supportedLocalesProp,
                /* eslint-enable no-unused-vars */
                isFetchingWithId: isFetchingWithIdProp,
                ...componentProps
            } = this.props;
            return (
                <WrappedComponent
                    fetchingProject={isFetchingWithIdProp}
                    {...componentProps}
                />
            );
        }
    }
    ProjectFetcherComponent.propTypes = {
        assetHost: PropTypes.string,
        canSave: PropTypes.bool,
        intl: intlShape.isRequired,
        isCreatingNew: PropTypes.bool,
        isTeacherPreview: PropTypes.bool,
        isFetchingWithId: PropTypes.bool,
        isFetchingWithoutId: PropTypes.bool,
        isLoadingProject: PropTypes.bool,
        isLoggedIn: PropTypes.bool,
        isShowingProject: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        onActivateTab: PropTypes.func,
        onChangeLanguage: PropTypes.func.isRequired,
        onError: PropTypes.func,
        onFetchedProjectData: PropTypes.func,
        onProjectLessons: PropTypes.func,
        onProjectUnchanged: PropTypes.func,
        projectHost: PropTypes.string,
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        resetToInitial: PropTypes.func,
        setAssetHost: PropTypes.func,
        setBaseUrl: PropTypes.func,
        setCsrfToken: PropTypes.func,
        setEditingUserId: PropTypes.func,
        setProjectData: PropTypes.func,
        setProjectHost: PropTypes.func,
        setProjectId: PropTypes.func,
        setProjectTitle: PropTypes.func,
        setRemixProjectId: PropTypes.func,
        setSession: PropTypes.func,
        setShareUrl: PropTypes.func,
        setStudioId: PropTypes.func,
        setStudioLessonsContent: PropTypes.func,
        showLessons: PropTypes.func,
        hideLessons: PropTypes.func,
        supportedLocales: PropTypes.arrayOf(PropTypes.string),
        updateProjectAssets: PropTypes.func
    };
    ProjectFetcherComponent.defaultProps = {
        assetHost: ITCH_CONFIG.ASSET_SERVER,
        projectHost: ITCH_CONFIG.PROJECT_SERVER
    };

    const mapStateToProps = state => {
        const isLoggedIn = state.session.session.user !== null &&
            typeof state.session.session.user !== 'undefined' &&
            typeof state.session.session.user.id !== 'undefined' &&
            Object.keys(state.session.session.user).length > 0 && state.session.session.user.id !== 0;
        let isTeacherPreview = false;
        if (ITCH_CONFIG.ITCH_LESSONS && typeof window.getScratchItchConfig === 'function'){
            const configs = window.getScratchItchConfig();
            if(configs.teacherPreview) {
                isTeacherPreview = configs.teacherPreview;
            }
        }
        return {
            isLoggedIn,
            isCreatingNew: getIsCreatingNew(state.scratchGui.projectState.loadingState),
            isTeacherPreview,
            isFetchingWithId: getIsFetchingWithId(state.scratchGui.projectState.loadingState),
            isLoadingProject: getIsLoading(state.scratchGui.projectState.loadingState),
            isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
            isFetchingWithoutId: getIsShowingWithoutId(state.scratchGui.projectState.loadingState),
            loadingState: state.scratchGui.projectState.loadingState,
            reduxProjectId: state.scratchGui.projectState.projectId,
            supportedLocales: Object.keys(state.locales.messagesByLocale)
        };
    };
    const mapDispatchToProps = dispatch => ({
        onActivateTab: tab => dispatch(activateTab(tab)),
        onError: error => dispatch(projectError(error)),
        onFetchedProjectData: (projectData, loadingState) =>
            dispatch(onFetchedProjectData(projectData, loadingState)),
        setProjectId: projectId => dispatch(setProjectId(projectId)),
        onProjectUnchanged: () => dispatch(setProjectUnchanged()),
        setSession: session => dispatch(updateSession(session)),
        setProjectTitle: title => dispatch(setProjectTitle(title)),
        setProjectData: (id, userId, projectHost, assetHost, lessons, isSubmitted) => dispatch(
            setProjectData(id, userId, projectHost, assetHost, lessons, isSubmitted)
        ),
        setShareUrl: url => dispatch(onShared(url)),
        updateProjectAssets: assets => dispatch(setProjectAssets(assets)),
        setStudioId: stdId => dispatch(setStudioId(stdId)),
        setEditingUserId: userId => dispatch(setEditingUserId(userId)),
        setRemixProjectId: projectId => dispatch(setRemixProjectId(projectId)),
        setAssetHost: url => dispatch(setAssetHost(url)),
        setBaseUrl: url => dispatch(setBaseUrl(url)),
        setCsrfToken: token => dispatch(setCsrfToken(token)),
        setProjectHost: url => dispatch(setProjectHost(url)),
        onProjectLessons: () => {
            dispatch(openProjectLessons());
        },
        setStudioLessonsContent: content => dispatch(setContent(content)),
        showLessons: (step, callback) => dispatch(activateLesson(step, callback)),
        hideLessons: () => dispatch(closeLessons()),
        resetToInitial: (json, name, thumbnail) => dispatch(resetToInitial(json, name, thumbnail)),
        onChangeLanguage: locale => dispatch(selectLocale(locale))
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(ProjectFetcherComponent));
};

export {
    ProjectFetcherHOC as default
};
