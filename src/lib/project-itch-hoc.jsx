import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import {setProjectUnchanged} from '../reducers/project-changed';

import {
    defaultProjectId,
    getIsFetchingWithoutId,
    setProjectId,
    LoadingStates,
    getIsCreatingNew,
    getIsFetchingWithId,
    getIsLoading,
    getIsShowingProject,
    onFetchedProjectData,
    projectError
} from '../reducers/project-state';
import {
    activateTab,
    BLOCKS_TAB_INDEX
} from '../reducers/editor-tab';

import log from './log';
import storage from './storage';

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with hash parsing behavior
 */
const ProjectItchHoc = function (WrappedComponent) {
    class ProjectItchComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleProjectChange',
                'fetchProject'
            ]);
            storage.setProjectHost(props.projectHost);
            storage.setAssetHost(props.assetHost);
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
        componentDidMount () {
            this.handleProjectChange();
        }
        componentDidUpdate (prevProps) {
            // if we are newly fetching a non-hash project...
            if ((this.props.isFetchingWithoutId && !prevProps.isFetchingWithoutId) ||
                (this.props.projectId !== prevProps.projectId)
            ) {
                this.handleProjectChange();
            }
            if (prevProps.projectHost !== this.props.projectHost) {
                storage.setProjectHost(this.props.projectHost);
            }
            if (prevProps.assetHost !== this.props.assetHost) {
                storage.setAssetHost(this.props.assetHost);
            }
            if (this.props.isFetchingWithId && !prevProps.isFetchingWithId) {
                this.fetchProject(this.props.reduxProjectId, this.props.loadingState);
            }
            if (this.props.isShowingProject && !prevProps.isShowingProject) {
                this.props.onProjectUnchanged();
            }
            if (this.props.isShowingProject && (prevProps.isLoadingProject || prevProps.isCreatingNew)) {
                this.props.onActivateTab(BLOCKS_TAB_INDEX);
            }
        }
        handleProjectChange () {
            const projectId = this.props.projectId || defaultProjectId;
            this.props.setProjectId(projectId.toString());
        }

        fetchProject (projectId, loadingState) {
            return this.props.fetchProject(projectId).then(projectAsset => {
                if (projectAsset) {
                    this.props.onFetchedProjectData(projectAsset.data, loadingState);
                } else {
                    // Treat failure to load as an error
                    // Throw to be caught by catch later on
                    throw new Error('Could not find project');
                }
            })
                .catch(err => {
                    this.props.onError(err);
                    log.error(err);
                });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                isFetchingWithoutId: isFetchingWithoutIdProp,
                reduxProjectId,
                setProjectId: setProjectIdProp,
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
    ProjectItchComponent.propTypes = {
        isFetchingWithoutId: PropTypes.bool,
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectId: PropTypes.func,
        assetHost: PropTypes.string,
        canSave: PropTypes.bool,
        intl: intlShape.isRequired,
        isCreatingNew: PropTypes.bool,
        isFetchingWithId: PropTypes.bool,
        isLoadingProject: PropTypes.bool,
        isShowingProject: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        onActivateTab: PropTypes.func,
        onError: PropTypes.func,
        onFetchedProjectData: PropTypes.func,
        onProjectUnchanged: PropTypes.func,
        projectHost: PropTypes.string,
        fetchProject: PropTypes.func
    };
    ProjectItchComponent.defaultProps = {
        assetHost: 'https://assets.scratch.mit.edu',
        projectHost: 'https://projects.scratch.mit.edu'
    };

    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;
        return {
            isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
            reduxProjectId: state.scratchGui.projectState.projectId,
            isCreatingNew: getIsCreatingNew(state.scratchGui.projectState.loadingState),
            isFetchingWithId: getIsFetchingWithId(state.scratchGui.projectState.loadingState),
            isLoadingProject: getIsLoading(state.scratchGui.projectState.loadingState),
            isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
            loadingState: state.scratchGui.projectState.loadingState
        };
    };
    const mapDispatchToProps = dispatch => ({
        onActivateTab: tab => dispatch(activateTab(tab)),
        onError: error => dispatch(projectError(error)),
        onFetchedProjectData: (projectData, loadingState) =>
            dispatch(onFetchedProjectData(projectData, loadingState)),
        setProjectId: projectId => dispatch(setProjectId(projectId)),
        onProjectUnchanged: () => dispatch(setProjectUnchanged())
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(ProjectItchComponent);
};

export {
    ProjectItchHoc as default
};
