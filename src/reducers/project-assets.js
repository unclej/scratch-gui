const SET_PROJECT_ASSET = 'scratch-gui/projectAssets/SET_PROJECT_ASSET';
const SET_PROJECT_JSON = 'scratch-gui/projectAssets/SET_PROJECT_JSON';
const SET_PROJECT_UPDATING_JSON = 'scratch-gui/projectAssets/SET_PROJECT_UPDATING_JSON';
const RESET_TO_INITIAL = 'scratch-gui/projectAssets/RESET_TO_INITIAL';
const SET_PROJECT_NAME = 'scratch-gui/projectAssets/SET_PROJECT_NAME';
const SET_THUMBNAIL_DATA = 'scratch-gui/projectAssets/SET_THUMBNAIL_DATA';
const initialState = {
    assets: [],
    json: null,
    updatingJson: null,
    savedProjectName: '',
    thumbnail: {
        md5: '',
        content: '',
        updatingContent: ''
    }
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_PROJECT_ASSET:
        return Object.assign({}, state, {
            assets: action.assets
        });
    case SET_THUMBNAIL_DATA:
        return Object.assign({}, state, {
            thumbnail: action.thumbnail
        });
    case SET_PROJECT_UPDATING_JSON:
        return Object.assign({}, state, {
            updatingJson: action.json
        });
    case SET_PROJECT_JSON:
        return Object.assign({}, state, {
            json: state.updatingJson
        });
    case RESET_TO_INITIAL:
        return Object.assign({}, state, {
            json: action.json,
            updatingJson: null,
            savedProjectName: action.name,
            thumbnail: {
                md5: action.md5,
                content: null,
                updatingContent: null
            }
        });
    case SET_PROJECT_NAME:
        return Object.assign({}, state, {
            savedProjectName: action.name
        });
    default:
        return state;
    }
};
const setProjectAssets = assets => ({
    type: SET_PROJECT_ASSET,
    assets: assets
});
const setProjectJson = json => ({
    type: SET_PROJECT_UPDATING_JSON,
    json: json
});
const updatedSuccessfully = function (){
    return {type: SET_PROJECT_JSON};
};
const resetToInitial = (json, name, md5) => ({
    type: RESET_TO_INITIAL,
    json: json,
    name: name,
    md5: md5
});
const setProjectName = name => ({
    type: SET_PROJECT_NAME,
    name: name
});
const setThumbnailData = thumbnail => ({
    type: SET_THUMBNAIL_DATA,
    thumbnail
});
export {
    reducer as default,
    initialState as projectAssetsInitialState,
    setProjectAssets,
    setProjectJson,
    updatedSuccessfully,
    resetToInitial,
    setProjectName,
    setThumbnailData
};
