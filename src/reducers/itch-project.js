import keyMirror from 'keymirror';

const DONE_SHARING = 'scratch-gui/itch-project/DONE_SHARING';
const START_SHARING = 'scratch-gui/itch-project/START_SHARING';
const SET_PROJECT_DATA = 'scratch-gui/itch-project/SET_PROJECT_DATA';
const SET_NO_SHARING_URL = 'scratch-gui/itch-project/SET_NO_SHARING_URL';
const SET_PROJECT_STUDIO_ID = 'scratch-gui/itch-project/SET_PROJECT_STUDIO_ID';
const SET_EDITING_USER_ID = 'scratch-gui/itch-project/SET_EDITING_USER_ID';
const SET_REMIX_PROJECT_ID = 'scratch-gui/itch-project/SET_REMIX_PROJECT_ID';
const SET_PROJECT_HOST = 'scratch-gui/itch-project/SET_PROJECT_HOST';
const SET_ASSET_HOST = 'scratch-gui/itch-project/SET_ASSET_HOST';
const SET_CSRF_TOKEN = 'scratch-gui/itch-project/SET_CSRF_TOKEN';
const SET_BASE_URL = 'scratch-gui/itch-project/SET_BASE_URL';
const LoadingState = keyMirror({
    NOT_SHARED: null,
    SHARING: null,
    SHARED: null,
    OPEN_SHARE_MODAL: null
});

const LoadingStates = Object.keys(LoadingState);

const getIsSharing = loadingState => (
    loadingState === LoadingState.SHARING &&
    loadingState !== LoadingState.SHARED
);
const getIsShared = loadingState => (
    loadingState === loadingState.SHARED ||
    loadingState === LoadingState.OPEN_SHARE_MODAL
);
const getIsOpenShareModal = loadingState => (
    loadingState === LoadingState.OPEN_SHARE_MODAL
);
const initialState = {
    projectId: null,
    studioId: null,
    shareUrl: null,
    lessons: [],
    activeLesson: null,
    loadingState: LoadingState.NOT_SHARED,
    projectUser: null,
    projectHost: null,
    assetHost: null,
    editingUser: null,
    remixProjectId: null,
    baseUrl: null,
    crsfToken: null,
    isSubmitted: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;

    switch (action.type) {
    case DONE_SHARING:
        return Object.assign({}, state, {
            loadingState: LoadingState.SHARED,
            shareUrl: action.url
        });
    case START_SHARING:
        if (state.loadingState === LoadingState.NOT_SHARED) {
            return Object.assign({}, state, {
                loadingState: LoadingState.SHARING
            });
        } else if (state.loadingState === LoadingState.SHARED) {
            return Object.assign({}, state, {
                loadingState: LoadingState.OPEN_SHARE_MODAL
            });
        }
        return state;
    case SET_PROJECT_DATA:
        return Object.assign({}, state, {
            projectId: action.id,
            projectUser: action.userId,
            projectHost: action.projectHost,
            assetHost: action.assetHost,
            lessons: action.lessons,
            isSubmitted: action.isSubmitted
        });
    case SET_NO_SHARING_URL:
        return Object.assign({}, state, {
            loadingState: LoadingState.NOT_SHARED,
            shareUrl: null
        });
    case SET_PROJECT_STUDIO_ID:
        return Object.assign({}, state, {
            studioId: action.studioId
        });
    case SET_EDITING_USER_ID:
        return Object.assign({}, state, {
            editingUser: action.userId
        });
    case SET_REMIX_PROJECT_ID:
        return Object.assign({}, state, {
            remixProjectId: action.projectId
        });
    case SET_PROJECT_HOST:
        return Object.assign({}, state, {
            projectHost: action.url
        });
    case SET_ASSET_HOST:
        return Object.assign({}, state, {
            assetHost: action.url
        });
    case SET_CSRF_TOKEN:
        return Object.assign({}, state, {
            crsfToken: action.token
        });
    case SET_BASE_URL:
        return Object.assign({}, state, {
            baseUrl: action.url
        });
    default:
        return state;
    }
};

const onSharing = id => ({
    type: START_SHARING,
    id: id
});
const onShared = url => {
    if (url && url !== '') {
        return {
            type: DONE_SHARING,
            url: url
        };
    }
    return {type: SET_NO_SHARING_URL};
};
const setProjectData = (id, userId, projectHost, assetHost, lessons, isSubmitted) => ({
    type: SET_PROJECT_DATA,
    id,
    userId,
    projectHost,
    assetHost,
    lessons,
    isSubmitted
});
const setStudioId = studioId => ({
    type: SET_PROJECT_STUDIO_ID,
    studioId
});
const setEditingUserId = userId => ({
    type: SET_EDITING_USER_ID,
    userId
});
const setRemixProjectId = projectId => ({
    type: SET_REMIX_PROJECT_ID,
    projectId
});
const setProjectHost = url => ({
    type: SET_PROJECT_HOST,
    url
});
const setAssetHost = url => ({
    type: SET_ASSET_HOST,
    url
});
const setCsrfToken = token => ({
    type: SET_CSRF_TOKEN,
    token
});
const setBaseUrl = url => ({
    type: SET_BASE_URL,
    url
});
export {
    reducer as default,
    initialState as itchProjectInitialState,
    LoadingState,
    LoadingStates,
    onSharing,
    onShared,
    getIsSharing,
    getIsShared,
    setProjectData,
    getIsOpenShareModal,
    setStudioId,
    setEditingUserId,
    setRemixProjectId,
    setProjectHost,
    setAssetHost,
    setCsrfToken,
    setBaseUrl
};
