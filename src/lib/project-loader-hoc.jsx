import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {injectIntl, intlShape} from 'react-intl';

import {setProjectId} from '../reducers/project-id';

import analytics from './analytics';
import log from './log';
import storage from './storage';
import request from 'request';
import ITCH_CONFIG from '../../itch.config';

/* Higher Order Component to provide behavior for loading projects by id. If
 * there's no id, the default project is loaded.
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectLoaderHOC = function (WrappedComponent) {
    class ProjectLoaderComponent extends React.Component {
        constructor (props) {
            super(props);
            this.UpdateAsset = this.UpdateAsset.bind(this);
            this.PROJECT_SERVER = ITCH_CONFIG.PROJECT_SERVER;
            this.URL_PARAMS = {};
            this.getConfigs();
            this.state = {
                projectData: null,
                projectName: '',
                thumbnail: '',
                projectUser: 0,
                userName: '',
                studioLessons: JSON.stringify([]),
                createdProject: false,
                fetchingProject: false
            };
            const projectHost = this.URL_PARAMS.apiUrl ? this.URL_PARAMS.apiUrl : props.projectHost;
            const assetHost = this.URL_PARAMS.assetsUrl ? this.URL_PARAMS.assetsUrl : props.assetHost;
            storage.setProjectHost(projectHost);
            storage.setAssetHost(assetHost);
            storage.setTranslatorFunction(props.intl.formatMessage);
            props.setProjectId(props.projectId);
            if (
                props.projectId !== '' &&
                props.projectId !== null &&
                typeof props.projectId !== 'undefined'
            ) {
                this.updateProject(props.projectId);
            }

        }
        componentDidMount () {
            if (this.props.projectId || this.props.projectId === 0) {
                this.UpdateAsset(this.props.projectId);
            }
        }
        componentWillUpdate (nextProps) {
            if (this.props.projectHost !== nextProps.projectHost) {
                storage.setProjectHost(nextProps.projectHost);
            }
            if (this.props.assetHost !== nextProps.assetHost) {
                storage.setAssetHost(nextProps.assetHost);
            }
            if (this.props.projectId !== nextProps.projectId) {
                this.props.setProjectId(nextProps.projectId);
                this.setState({fetchingProject: true}, () => {
                    this.UpdateAsset(nextProps.projectId);
                });
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
            this.PROJECT_SERVER = this.URL_PARAMS.apiUrl ? (`${this.URL_PARAMS.apiUrl}project`) : ITCH_CONFIG.PROJECT_SERVER;
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
        UpdateAsset (projectId) {
            const self = this;
            if (projectId === 0){
                request.post(`${self.PROJECT_SERVER}/create`,
                    {form: {
                        name: 'Untitled',
                        remix_of: self.fetchRemixProjectId(),
                        user_id: self.fetchUserId(),
                        studioID: self.fetchStudioId()
                    }},
                    (error, response, body) => {
                        const project = JSON.parse(body);
                        if (!project.error){
                            window.location.hash = `#${project.projectID}`;
                            self.setState({createdProject: true});
                        }
                    });
            } else {
                request.get(`${ITCH_CONFIG.ASSET_SERVER}/crossdomain.xml`, {mode: 'no-cors'},
                    () => {
                    });
                storage
                    .load(storage.AssetType.Project, projectId, storage.DataFormat.JSON)
                    .then(projectAsset => {
                        const project = JSON.parse(projectAsset.data.toString()).project;
                        const user = JSON.parse(projectAsset.data.toString()).user;
                        let projectJson;
                        if (typeof project.json !== 'undefined' && typeof project.json !== 'object'){
                            projectJson = JSON.parse(project.json);
                        } else {
                            projectJson = project.json;
                        }
                        if (typeof projectJson.targets !== 'undefined'){
                            for (let i = 0; i < projectJson.targets.length; i++){
                                if (
                                    typeof projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'] !==
                                    'undefined' &&
                                    projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'].type === ''){
                                    delete projectJson.targets[i].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'];
                                }
                            }
                        }
                        project.json = JSON.stringify(projectJson);
                        if (1 * project.user_id === self.fetchUserId() && 1 * self.fetchStudioId() !== 0){
                            request.post(`${self.PROJECT_SERVER}/studio/${self.fetchStudioId()}/lessons`,
                                {form: {user_id: self.fetchUserId()}},
                                (error, response, body) => {
                                    const lessonsData = JSON.parse(body);
                                    let lessons = [];
                                    if (lessonsData.error === false && lessonsData.lessons){
                                        lessons = lessonsData.lessons;
                                    }
                                    self.setState({
                                        projectData: project.json,
                                        projectName: project.name,
                                        thumbnail: project.thumbnail,
                                        projectUser: 1 * project.user_id,
                                        studioLessons: JSON.stringify(lessons),
                                        fetchingProject: false,
                                        userName: user
                                    });
                                    const projectNameTextInput = document.getElementById('projectNameTextInput');
                                    if (projectNameTextInput){
                                        projectNameTextInput.value = (project.name === 'Untitled') ? '' : project.name;
                                    }
                                });
                        } else {
                            self.setState({
                                projectData: project.json,
                                projectName: project.name,
                                thumbnail: project.thumbnail,
                                projectUser: 1 * project.user_id,
                                fetchingProject: false,
                                userName: user
                            });
                            const projectNameTextInput = document.getElementById('projectNameTextInput');
                            if (projectNameTextInput){
                                projectNameTextInput.value = (project.name === 'Untitled') ? '' : project.name;
                            }
                        }
                    })
                    .then(() => {
                        if (projectId !== 0) {
                            analytics.event({
                                category: 'project',
                                action: 'Load Project',
                                value: projectId,
                                nonInteraction: true
                            });
                        }
                    })
                    .catch(err => log.error(err));
            }

        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                assetHost,
                projectHost,
                projectId,
                setProjectId: setProjectIdProp,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;
            if (!this.state.projectData) return null;
            return (
                <WrappedComponent
                    createdProject={this.state.createdProject}
                    fetchingProject={this.state.fetchingProject}
                    projectData={this.state.projectData}
                    projectName={this.state.projectName}
                    projectUser={this.state.projectUser}
                    studioLessons={this.state.studioLessons}
                    thumbnail={this.state.thumbnail}
                    userName={this.state.userName}
                    {...componentProps}
                />
            );
        }
    }
    ProjectLoaderComponent.propTypes = {
        assetHost: PropTypes.string,
        intl: intlShape.isRequired,
        projectHost: PropTypes.string,
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectId: PropTypes.func
    };
    ProjectLoaderComponent.defaultProps = {
        assetHost: 'https://d3dch2j0kvht3t.cloudfront.net/public/',
        projectHost: 'http://localhost/itch/api/v1/',
        projectId: 0
    };

    const mapStateToProps = () => ({});

    const mapDispatchToProps = dispatch => ({
        setProjectId: id => dispatch(setProjectId(id))
    });

    return injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProjectLoaderComponent));
};

export {
    ProjectLoaderHOC as default
};
