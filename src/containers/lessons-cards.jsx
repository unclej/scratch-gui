import {connect} from 'react-redux';

import {
    activateDeck,
    closeCards,
    dragCard,
    startDrag,
    endDrag
} from '../reducers/lessons';

import {
    openProjectLessons
} from '../reducers/modals';

import LessonCardsComponent from '../components/lesson-cards/lesson-cards.jsx';

const mapStateToProps = state => ({
    visible: state.scratchGui.lessons.visible,
    content: state.scratchGui.lessons.content,
    activeDeckId: state.scratchGui.lessons.activeDeckId,
    step: state.scratchGui.lessons.step,
    x: state.scratchGui.lessons.x,
    y: state.scratchGui.lessons.y,
    dragging: state.scratchGui.lessons.dragging,
    lessonName: state.scratchGui.lessons.lessonName
});

const mapDispatchToProps = dispatch => ({
    onActivateDeckFactory: (id, content) => dispatch(activateDeck(id, content)),
    onShowAll: () => {
        dispatch(openProjectLessons());
        dispatch(closeCards());
    },
    onCloseCards: () => dispatch(closeCards()),
    /* onNextStep: () => dispatch(nextStep()),
    onPrevStep: () => dispatch(prevStep()), */
    onDrag: (e_, data) => dispatch(dragCard(data.x, data.y)),
    onStartDrag: () => dispatch(startDrag()),
    onEndDrag: () => dispatch(endDrag())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LessonCardsComponent);
