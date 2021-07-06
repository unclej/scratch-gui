import {connect} from 'react-redux';

import {
    closeLessons,
    dragLessons,
    startDrag,
    endDrag,
    nextStep,
    prevStep,
    shrinkExpandLessons
} from '../reducers/studioLessons';

import {
    getIsFetchingWithId,
    getIsLoadingWithId
} from '../reducers/project-state';

import LessonCardsComponent from '../components/lesson-cards/lesson-cards.jsx';

const mapStateToProps = state => {
    const autoPlayVideo = !state.scratchGui.stageSize.isFullScreen && !state.scratchGui.stageSize.isProjectPage && !(
        getIsFetchingWithId(state.scratchGui.projectState.loadingState) ||
        getIsLoadingWithId(state.scratchGui.projectState.loadingState) ||
        state.scratchGui.modals.loadingProject
    );
    const step = state.scratchGui.studioLessons.step;
    return {
        visible: state.scratchGui.studioLessons.visible,
        content: state.scratchGui.studioLessons.content,
        activeLessonId: state.scratchGui.studioLessons.activeLessonId,
        step: step === null ? null : 1 * step,
        expanded: state.scratchGui.studioLessons.expanded,
        x: state.scratchGui.studioLessons.x,
        y: state.scratchGui.studioLessons.y,
        isRtl: state.locales.isRtl,
        dragging: state.scratchGui.studioLessons.dragging,
        lessonName: state.scratchGui.studioLessons.lessonName,
        autoPlayVideo
    };
};

const mapDispatchToProps = dispatch => ({
    onCloseCards: () => dispatch(closeLessons()),
    onShrinkExpandLessons: () => dispatch(shrinkExpandLessons()),
    onNextStep: () => dispatch(nextStep()),
    onPrevStep: () => dispatch(prevStep()),
    onDrag: (e_, data) => dispatch(dragLessons(data.x, data.y)),
    onStartDrag: () => dispatch(startDrag()),
    onEndDrag: () => dispatch(endDrag())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LessonCardsComponent);
