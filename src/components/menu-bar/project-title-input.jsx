import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import {setProjectTitle} from '../../reducers/project-title';
import {setProjectChanged} from '../../reducers/project-changed';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import Input from '../forms/input.jsx';
const BufferedInput = BufferedInputHOC(Input);

import styles from './project-title-input.css';
import ITCH_CONFIG from "../../../itch.config";

const messages = defineMessages({
    projectTitlePlaceholder: {
        id: 'gui.gui.projectTitlePlaceholder',
        description: 'Placeholder for project title when blank',
        defaultMessage: 'Project title here'
    }
});

const ProjectTitleInput = ({
    className,
    intl,
    onSubmit,
    projectTitle
}) => (
    <BufferedInput
        className={classNames(styles.titleField, className)}
        maxLength="100"
        placeholder={intl.formatMessage(messages.projectTitlePlaceholder)}
        tabIndex="0"
        type="text"
        value={projectTitle}
        onSubmit={onSubmit}
    />
);

ProjectTitleInput.propTypes = {
    canEditTitle: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onProjectChanged: PropTypes.func,
    reduxProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSubmit: PropTypes.func,
    projectTitle: PropTypes.string
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
    let isPreview = false;
    if (ITCH_CONFIG.ITCH_LESSONS && typeof window.getScratchItchConfig === 'function'){
        const configs = window.getScratchItchConfig();
        isPreview = configs.isPreview;
    }
    return {
        projectTitle: state.scratchGui.projectTitle,
        canEditTitle: userOwnsProject && !isSubmitted && !isPreview,
        reduxProjectId: state.scratchGui.projectState.projectId,
    };
};

const mapDispatchToProps  = dispatch => ({
    onSubmit: title => {
        dispatch(setProjectTitle(title));
        dispatch(setProjectChanged())
    },
    onProjectChanged: () => dispatch(setProjectChanged())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectTitleInput));
