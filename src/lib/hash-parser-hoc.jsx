import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
    defaultProjectId,
    getIsFetchingWithoutId,
    getIsShowingWithoutId,
    setProjectId
} from '../reducers/project-state';
import ITCH_CONFIG from '../../itch.config';

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
                'updateProjectIdFromConfigs'
            ]);
        }
        componentDidMount () {
            if (typeof window.getScratchItchConfig === 'function') {
                window.updateScratchProjectId = this.updateProjectIdFromConfigs;
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
            if (typeof window.getScratchItchConfig === 'function') {
                // eslint-disable-next-line no-undefined
                window.updateScratchData = undefined;
            } else {
                window.removeEventListener('hashchange', this.handleHashChange);
            }

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
        render () {
            const {
                /* eslint-disable no-unused-vars */
                isFetchingWithoutId: isFetchingWithoutIdProp,
                reduxProjectId,
                setProjectId: setProjectIdProp,
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
        isShowingWithoutId: PropTypes.bool,
        reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        setProjectId: PropTypes.func
    };
    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;
        return {
            isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
            isShowingWithoutId: getIsShowingWithoutId(loadingState),
            reduxProjectId: state.scratchGui.projectState.projectId
        };
    };
    const mapDispatchToProps = dispatch => ({
        setProjectId: projectId => {
            dispatch(setProjectId(projectId));
        }
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
