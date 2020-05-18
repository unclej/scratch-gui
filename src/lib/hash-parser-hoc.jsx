import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
    defaultProjectId,
    getIsFetchingWithId,
    getIsFetchingWithoutId,
    getIsShowingWithoutId,
    setProjectId
} from '../reducers/project-state';
import {
    resetToInitialStudioLessons
} from '../reducers/studioLessons';
import ITCH_CONFIG from '../../itch.config';
import storage from "./storage";
import {
    setCsrfToken,
    setEditingUserId,
    setStudioId
} from "../reducers/itch-project";
import {openPreviewProject} from "../reducers/modals";

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with hash parsing behavior
 */
const HashParserHOC = function (WrappedComponent) {
    class HashParserComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleHashChange',
                'updateProjectIdFromConfigs',
                'updateProjectFromConfigs'
            ]);
        }
        componentDidMount () {
            if (typeof window.getBackPackHost === 'function') {
                window.updateScratchProjectId = this.updateProjectIdFromConfigs;
                window.updateProjectFromConfigs = this.updateProjectFromConfigs;
                if(typeof window.getScratchItchConfig === 'function')
                    this.updateProjectIdFromConfigs();
            } else {
                window.addEventListener('hashchange', this.handleHashChange);
                this.handleHashChange();
            }

        }
        componentDidUpdate (prevProps) {
            // if we are newly fetching a non-hash project...
            if (this.props.isFetchingWithoutId && !prevProps.isFetchingWithoutId && !ITCH_CONFIG.ITCH_LESSONS) {
                // ...clear the hash from the url
                history.pushState('new-project', 'new-project',
                    window.location.pathname + window.location.search);
            }
        }
        componentWillUnmount () {
            window.removeEventListener('hashchange', this.handleHashChange);
        }
        handleHashChange () {
            let hashProjectId;
            if (typeof window.getScratchItchConfig === 'function') {
                const data = window.getScratchItchConfig();
                hashProjectId = data && data.projectId ? data.projectId : defaultProjectId;
            } else {
                const hashMatch = window.location.hash.match(/#(\d+)/);
                hashProjectId = hashMatch === null ? defaultProjectId : hashMatch[1];
            }
            this.props.setProjectId(hashProjectId.toString());
            if (hashProjectId !== defaultProjectId && !this.props.isFetchingWithoutId) {
                this.setState({hideIntro: true});
            }
        }
        updateProjectIdFromConfigs (){
            const data = window.getScratchItchConfig();
            const hashProjectId = data && data.projectId ? data.projectId : defaultProjectId;
            this.props.setProjectId(hashProjectId.toString());
            if (hashProjectId !== defaultProjectId && !this.props.isFetchingWithoutId) {
                this.setState({hideIntro: true});
            }
        }
        updateProjectFromConfigs (){
            const configs = window.getScratchItchConfig();
            const loggedInUserId = 0;
            const hashProjectId = configs && configs.projectId ? configs.projectId : defaultProjectId;
            storage.setLoggedInUser(loggedInUserId);
            storage.setLoggedInStudioId(configs.courseId);
            storage.setToken(configs.token);
            if (configs.starterProjectId) {
                storage.setStarterProjectId(configs.starterProjectId);
            }
            if(configs.projectData) {
                storage.setProjectData(configs.projectData);
            }
            if (hashProjectId !== defaultProjectId && !this.props.isFetchingWithoutId) {
                this.setState({hideIntro: true});
            }
            this.props.setCsrfToken(configs.token);
            this.props.setEditingUserId(loggedInUserId);
            this.props.setStudioId(configs.courseId);
            this.props.resetToInitialStudioLessons();
            this.props.setProjectId(hashProjectId.toString());
            if(configs.isPreview && configs.openPreviewProjectModal) {
                this.props.openPreviewProject();
            }
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                isFetchingWithoutId: isFetchingWithoutIdProp,
                isFetchingWithId: isFetchingWithIdProp,
                reduxProjectId,
                setProjectId: setProjectIdProp,
                openPreviewProject: openPreviewProjectProp,
                resetToInitialStudioLessons: resetToInitialStudioLessonsProp,
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
    HashParserComponent.propTypes = {
        isFetchingWithoutId: PropTypes.bool,
        isFetchingWithId: PropTypes.bool,
        isShowingWithoutId: PropTypes.bool,
        setCsrfToken: PropTypes.func,
        setEditingUserId: PropTypes.func,
        setStudioId: PropTypes.func,
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectId: PropTypes.func,
        openPreviewProject: PropTypes.func,
        resetToInitialStudioLessons: PropTypes.func
    };
    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;
        return {
            isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
            isFetchingWithId: getIsFetchingWithId(loadingState),
            isShowingWithoutId: getIsShowingWithoutId(loadingState),
            reduxProjectId: state.scratchGui.projectState.projectId
        };
    };
    const mapDispatchToProps = dispatch => ({
        setProjectId: projectId => {
            dispatch(setProjectId(projectId));
        },
        openPreviewProject: () => dispatch(openPreviewProject()),
        setStudioId: stdId => dispatch(setStudioId(stdId)),
        setEditingUserId: userId => dispatch(setEditingUserId(userId)),
        setCsrfToken: token => dispatch(setCsrfToken(token)),
        resetToInitialStudioLessons: () => dispatch(resetToInitialStudioLessons())
    });
    // Allow incoming props to override redux-provided props. Used to mock in tests.
    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {}, stateProps, dispatchProps, ownProps
    );
    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(HashParserComponent);
};

export {
    HashParserHOC as default
};
