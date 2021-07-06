/* eslint-disable react/no-unused-prop-types */
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

const mapStateToProps = (state, ownProps) => {
    const isSubmitted = state.scratchGui.itchProject.isSubmitted;
    const isPreview = false;
    return {
        projectTitle: state.scratchGui.projectTitle,
        canEditTitle: ownProps.userOwnsProject && !isSubmitted && !isPreview,
        reduxProjectId: state.scratchGui.projectState.projectId
    };
};

const mapDispatchToProps = dispatch => ({
    onSubmit: title => {
        dispatch(setProjectTitle(title));
        dispatch(setProjectChanged());
    },
    onProjectChanged: () => dispatch(setProjectChanged())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectTitleInput));
