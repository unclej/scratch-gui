import ScratchStorage from 'scratch-storage';

import defaultProject from './default-project';

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor () {
        super();
        // this.cacheDefaultProject();
        this.addWebStore(
            [this.AssetType.Project],
            this.getProjectGetConfig.bind(this),
            this.getProjectCreateConfig.bind(this),
            this.getProjectUpdateConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap],
            this.getAssetGetConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.Sound],
            this.getAssetGetConfig.bind(this)
            // asset => `static/extension-assets/scratch3_music/${asset.assetId}.${asset.dataFormat}`
        );
    }
    setLoggedInUser (id) {
        this.loggedInUser = id;
    }
    setLoggedInStudioId (id) {
        this.loggedInStudio = id;
    }
    setProjectHost (projectHost) {
        this.projectHost = projectHost;
    }
    getProjectGetConfig (projectAsset) {
        return `${this.projectHost}project/user/${this.loggedInUser}/${projectAsset.assetId}/${this.loggedInStudio}/get`;
    }
    getProjectCreateConfig () {
        return {
            url: `${this.projectHost}project/create`,
            withCredentials: false
        };
    }
    getProjectUpdateConfig (projectAsset) {
        return {
            url: `${this.projectHost}project/${projectAsset.assetId}/update`,
            withCredentials: false
        };
    }
    setAssetHost (assetHost) {
        this.assetHost = assetHost;
    }
    getAssetGetConfig (asset) {
        const time = Date.now();
        return `${this.assetHost}${asset.assetId}.${asset.dataFormat}?time=${time}`;
    }
    getAssetUpdateConfig (md5){
        return `${this.projectHost}project/assets/${md5}`;
    }
    getThumbnailUpdateConfig (projectId, md5){
        return `${this.projectHost}project/${projectId}/thumbnail/${md5}`;
    }
    getLessonReadUrl (projectId){
        return `${this.projectHost}project/${projectId}/lesson/mark-as-read`;
    }
    getShareUrl (projectId){
        return `${this.projectHost}project/${projectId}/share`;
    }
    setTranslatorFunction (translator) {
        this.translator = translator;
        this.cacheDefaultProject();
    }
    cacheDefaultProject () {
        const defaultProjectAssets = defaultProject(this.translator);
        defaultProjectAssets.forEach(asset => this.builtinHelper._store(
            this.AssetType[asset.assetType],
            this.DataFormat[asset.dataFormat],
            asset.data,
            asset.id
        ));
    }
}

const storage = new Storage();

export default storage;
