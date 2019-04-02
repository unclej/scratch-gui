import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import React from 'react';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import {setProjectChanged} from '../../reducers/project-changed';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import Input from '../forms/input.jsx';
const BufferedInput = BufferedInputHOC(Input);

import styles from './project-title-input.css';

const messages = defineMessages({
    projectTitlePlaceholder: {
        id: 'gui.gui.projectTitlePlaceholder',
        description: 'Placeholder for project title when blank',
        defaultMessage: 'Project title here'
    }
});

class ProjectTitleInput extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUpdateProjectTitle'
        ]);
    }
    // call onUpdateProjectTitle if it is defined (only defined when gui
    // is used within scratch-www)
    handleUpdateProjectTitle (newTitle) {
        if (this.props.onUpdateProjectTitle) {
            this.props.onUpdateProjectTitle(newTitle);
            this.props.onProjectChanged();
            /* const opts = {
                method: 'post',
                url: `${storage.projectHost}project/${this.props.reduxProjectId}/update-title`,
                body: JSON.stringify({title: newTitle}),
                // If we set json:true then the body is double-stringified, so don't
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false
            };
            xhr(opts, (err, response) => {
                console.log(response, err);
            }); */
            
        }
    }
    render () {
        return (
            <BufferedInput
                className={classNames(styles.titleField, this.props.className)}
                disabled={!this.props.canEditTitle}
                maxLength="100"
                placeholder={this.props.intl.formatMessage(messages.projectTitlePlaceholder)}
                tabIndex="0"
                type="text"
                value={this.props.projectTitle}
                onSubmit={this.handleUpdateProjectTitle}
            />
        );
    }
}

ProjectTitleInput.propTypes = {
    canEditTitle: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onUpdateProjectTitle: PropTypes.func,
    onProjectChanged: PropTypes.func,
    projectTitle: PropTypes.string,
    reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const mapStateToProps = state => {
    const isLoggedIn = state.session.session.user !== null &&
        typeof state.session.session.user !== 'undefined' &&
        Object.keys(state.session.session.user).length > 0;
    const userOwnsProject = isLoggedIn && state.scratchGui.itchProject.projectUser !== null &&
        typeof state.session.session.user !== 'undefined' &&
        typeof state.session.session.user.id !== 'undefined' &&
        state.session.session.user.id === state.scratchGui.itchProject.projectUser;
    const isSubmitted = state.scratchGui.itchProject.isSubmitted;
    return {
        projectTitle: state.scratchGui.projectTitle,
        canEditTitle: userOwnsProject && !isSubmitted,
        reduxProjectId: state.scratchGui.projectState.projectId,
    };
};

const mapDispatchToProps  = dispatch => ({
    onProjectChanged: () => dispatch(setProjectChanged()),
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectTitleInput));
