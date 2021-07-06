/* eslint-disable no-warning-comments */
import ScratchStorage from 'scratch-storage';

import defaultProject from './default-project';

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor () {
        super();
        this.cacheDefaultProject();
    }
    addOfficialScratchWebStores () {
        this.addWebStore(
            [this.AssetType.Project],
            this.getProjectGetConfig.bind(this),
            this.getProjectCreateConfig.bind(this),
            this.getProjectUpdateConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
            this.getAssetGetConfig.bind(this),
            // We set both the create and update configs to the same method because
            // storage assumes it should update if there is an assetId, but the
            // asset store uses the assetId as part of the create URI.
            this.getAssetGetConfig.bind(this),
            this.getAssetCreateConfig.bind(this)
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
    setStarterProjectId (id) {
        this.starterProjectId = id ? id : 0;
    }
    setProjectHost (projectHost) {
        this.projectHost = projectHost;
    }
    setAssetCreateHost (createHost) {
        this.assetCreateHost = createHost;
    }
    setProjectData (projectData) {
        this.projectData = projectData;
    }
    setToken (token) {
        this.token = token;
    }
    getToken () {
        return this.token;
    }
    getProjectData () {
        return this.token;
    }
    getLoggedInStudioId () {
        return this.loggedInStudio;
    }
    getProjectGetConfig (projectAsset) {
        const config = {
            url: `${this.projectHost}/${projectAsset.assetId}`
        };
        const token = this.getToken();
        if (token) {
            config.headers = {
                Authorization: `Bearer ${token}`
            };
        }
        return config;
    }
    getProjectCreateConfig () {
        return {
            url: `${this.projectHost}project/create`,
            headers: {
                Authorization: `Bearer ${this.getToken()}`
            }
        };
    }
    getProjectUpdateConfig (projectAsset) {
        return {
            url: `${this.projectHost}/${projectAsset.assetId}/update`,
            headers: {
                Authorization: `Bearer ${this.getToken()}`
            },
            withCredentials: true
        };
    }
    setAssetHost (assetHost) {
        this.assetHost = assetHost;
    }
    getAssetGetConfig (asset) {
        const time = Date.now();
        return `${this.assetHost}${asset.assetId}.${asset.dataFormat}?time=${time}`;
    }
    getAssetUpdateConfig (md5) {
        return `${this.assetCreateHost}/${md5}`;
    }
    getThumbnailUpdateConfig (projectId, md5) {
        return `${this.assetCreateHost}project/${projectId}/thumbnail/${md5}`;
    }
    getLessonReadUrl (projectId) {
        return `${this.projectHost}project/${projectId}/lesson/mark-as-read`;
    }
    getShareUrl (projectId) {
        return `${this.projectHost}project/${projectId}/share`;
    }
    getAssetCreateConfig (asset) {
        return {
            method: 'post',
            url: `${this.assetCreateHost}project/${this.starterProjectId}/asset/${asset.assetId}.${asset.dataFormat}`,
            withCredentials: false,
            headers: {
                'Authorization': `Bearer ${this.getToken()}`,
                'Content-Type': 'application/json'
            }
        };
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
