const CLOSE_LESSONS = 'scratch-gui/studioLessons/CLOSE_LESSONS';
const VIEW_LESSONS = 'scratch-gui/studioLessons/VIEW_LESSONS';
const ACTIVATE_LESSON = 'scratch-gui/studioLessons/ACTIVATE_LESSON';
const NEXT_STEP = 'scratch-gui/studioLessons/NEXT_STEP';
const PREV_STEP = 'scratch-gui/studioLessons/PREV_STEP';
const DRAG_LESSONS = 'scratch-gui/studioLessons/DRAG_LESSONS';
const START_DRAG = 'scratch-gui/studioLessons/START_DRAG';
const END_DRAG = 'scratch-gui/studioLessons/END_DRAG';
const SET_LESSON_CONTENT = 'scratch-gui/studioLessons/SET_LESSON_CONTENT';

const initialState = {
    visible: false,
    content: [],
    activeLessonId: null,
    x: 300,
    y: 85,
    dragging: false,
    lessonName: '',
    step: null
};
const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case CLOSE_LESSONS:
        return Object.assign({}, state, {
            visible: false
        });
    case VIEW_LESSONS:
        return Object.assign({}, state, {
            visible: true
        });
    case SET_LESSON_CONTENT:
        return Object.assign({}, state, {
            content: action.content
        });
    case ACTIVATE_LESSON:
        if (state.activeLessonId === null){
            const lesson = state.content[action.step];
            return Object.assign({}, state, {
                step: action.step,
                visible: true,
                lessonName: lesson.name,
                activeLessonId: lesson.id
            });
        }
        return Object.assign({}, state, {
            visible: true
        });
    case NEXT_STEP:
        if (state.activeLessonId !== null && (state.step + 1) < state.content.length) {
            const step = (state.step + 1);
            const lesson = state.content[step];
            return Object.assign({}, state, {
                step: step,
                lessonName: lesson.name,
                activeLessonId: lesson.id

            });
        }
        return state;
    case PREV_STEP:
        if (state.activeLessonId !== null && state.step > 0) {
            const step = (state.step - 1);
            const lesson = state.content[step];
            return Object.assign({}, state, {
                step: step,
                lessonName: lesson.name,
                activeDeckId: lesson.id
            });
        }
        return state;
    case DRAG_LESSONS:
        return Object.assign({}, state, {
            x: action.x,
            y: action.y
        });
    case START_DRAG:
        return Object.assign({}, state, {
            dragging: true
        });
    case END_DRAG:
        return Object.assign({}, state, {
            dragging: false
        });
    default:
        return state;
    }
};
const setContent = function (content){
    return {
        type: SET_LESSON_CONTENT,
        content
    };
};
const activateLesson = function (step, callback) {
    return {
        type: ACTIVATE_LESSON,
        step,
        callback
    };
};

const viewLessons = function () {
    return {type: VIEW_LESSONS};
};

const closeLessons = function () {
    return {type: CLOSE_LESSONS};
};

const nextStep = function (callback) {
    return {type: NEXT_STEP, callback};
};

const prevStep = function (callback) {
    return {type: PREV_STEP, callback};
};

const dragLessons = function (x, y) {
    return {type: DRAG_LESSONS, x, y};
};

const startDrag = function () {
    return {type: START_DRAG};
};

const endDrag = function () {
    return {type: END_DRAG};
};


export {
    reducer as default,
    initialState as studioLessonsInitialState,
    activateLesson,
    viewLessons,
    closeLessons,
    nextStep,
    prevStep,
    dragLessons,
    startDrag,
    endDrag,
    setContent
};
