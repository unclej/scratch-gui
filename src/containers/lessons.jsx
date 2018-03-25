import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';

import analytics from '../lib/analytics';
import LessonsComponent from '../components/lessons/lessons.jsx';

import {connect} from 'react-redux';

import {
    closeProjectLessons
} from '../reducers/modals';

import {
    activateDeck
} from '../reducers/lessons';

const messages = defineMessages({
    lessonsTitle: {
        defaultMessage: 'Choose an Lesson',
        description: 'Heading for the lessons',
        id: 'gui.projectLesson.lessons'
    }
});

class Lessons extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
    }
    handleItemSelect (id) {
        const item = this.props.lessons[id];
        const obj = {};
        this.props.lessons.forEach(data => {
            obj[data.id] = data;
        });
        this.props.onActivateDeck(item.id, obj, id, this.props.markLessonAsRead);
        analytics.event({
            category: 'lessons',
            action: 'Select lesson',
            label: item.name
        });
    }
    render () {
        if (!this.props.visible) return null;
        return (
            <LessonsComponent
                data={this.props.lessons}
                filterable={false}
                id="projectLessons"
                title={this.props.intl.formatMessage(messages.lessonsTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

Lessons.propTypes = {
    intl: intlShape.isRequired,
    lessons: PropTypes.arrayOf(PropTypes.object),
    markLessonAsRead: PropTypes.bool,
    onActivateDeck: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool
};

const mapStateToProps = state => ({
    visible: state.scratchGui.modals.projectLessons
});

const mapDispatchToProps = dispatch => ({
    onActivateDeck: (id, content, step, callback) => dispatch(activateDeck(id, content, step, callback)),
    onRequestClose: () => dispatch(closeProjectLessons())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(Lessons));
