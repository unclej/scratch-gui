import analytics from '../lib/analytics';
import projectImpl from '../lib/project';

const CLOSE_LESSONS = 'scratch-gui/lessons/CLOSE_LESSONS';
const VIEW_LESSONS = 'scratch-gui/lessons/VIEW_LESSONS';
const ACTIVATE_DECK = 'scratch-gui/lessons/ACTIVATE_DECK';
const NEXT_STEP = 'scratch-gui/lessons/NEXT_STEP';
const PREV_STEP = 'scratch-gui/lessons/PREV_STEP';
const DRAG_LESSONS = 'scratch-gui/lessons/DRAG_LESSONS';
const START_DRAG = 'scratch-gui/lessons/START_DRAG';
const END_DRAG = 'scratch-gui/lessons/END_DRAG';

const initialState = {
    visible: false,
    content: [],
    activeDeckId: null,
    step: 0,
    x: 292,
    y: 365,
    dragging: false,
    lessonName:''
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
    case ACTIVATE_DECK:
         var lesson = action.content[action.activeDeckId];
        if(!lesson.read){
            var project = new projectImpl();
            project.markLessonAsRead(action.activeDeckId,action.callback)
        }
        return Object.assign({}, state, {
            activeDeckId: action.activeDeckId,
            content:action.content,
            step:action.step,
            visible: true,
            lessonName:action.content[action.activeDeckId].name
        });
    case NEXT_STEP:
        if (state.activeDeckId !== null) {
            analytics.event({
                category: 'how-to',
                action: 'next step',
                label: `${state.activeDeckId} - ${state.step}`
            });
            var steps = state.content[state.activeDeckId].steps;
            var lessonId = steps[(state.step + 1)][0].id
            var lesson = state.content[lessonId];
            if(!lesson.read){
                var project = new projectImpl();
                project.markLessonAsRead(lessonId,action.callback)
            }
            return Object.assign({}, state, {
                step: state.step + 1,
                lessonName:lesson.name,
                activeDeckId:lessonId
            });
        }
        return state;
    case PREV_STEP:
        if (state.activeDeckId !== null) {
            if (state.step > 0) {
                var steps = state.content[state.activeDeckId].steps;
                var lessonId = steps[(state.step - 1)][0].id
                var lesson = state.content[lessonId];
                if(!lesson.read){
                    var project = new projectImpl();
                    project.markLessonAsRead(lessonId,action.callback)
                }
                return Object.assign({}, state, {
                    step: state.step - 1,
                    lessonName:lesson.name,
                    activeDeckId:lessonId
                });
            }
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

const activateDeck = function (activeDeckId,content,step,callback) {
    return {
        type: ACTIVATE_DECK,
        activeDeckId,
        content,
        step,
        callback
    };
};

const viewCards = function () {
    return {type: VIEW_LESSONS};
};

const closeCards = function () {
    return {type: CLOSE_LESSONS};
};

const nextStep = function (callback) {
    return {type: NEXT_STEP,callback};
};

const prevStep = function (callback) {
    return {type: PREV_STEP,callback};
};

const dragCard = function (x, y) {
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
    initialState as lessonsInitialState,
    activateDeck,
    viewCards,
    closeCards,
    nextStep,
    prevStep,
    dragCard,
    startDrag,
    endDrag
};
