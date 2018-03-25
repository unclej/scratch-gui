import ScratchStorage from 'scratch-storage';

import ITCH_CONFIG from '../../itch.config';

let PROJECT_SERVER = '';
let LOGGED_IN_USER = 0;
const ASSET_SERVER = ITCH_CONFIG.ASSET_SERVER;

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor () {
        super();
        this.getConfigs();
        this.addWebStore(
            [this.AssetType.Project],
            this.getProjectGetConfig.bind(this),
            this.getProjectCreateConfig.bind(this),
            this.getProjectUpdateConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
            this.getAssetGetConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.Sound],
            asset => `${this.assetHost}/${asset.assetId}.${asset.dataFormat}`
        );
    }
    setProjectHost (projectHost) {
        this.projectHost = projectHost;
    }
    getProjectGetConfig (projectAsset) {
        return `${this.projectHost}project/user/${LOGGED_IN_USER}/${projectAsset.assetId}/get`;
    }
    getProjectCreateConfig () {
        return {
            url: `${this.projectHost}project/create`,
            withCredentials: true
        };
    }
    getProjectUpdateConfig (projectAsset) {
        return {
            url: `${this.projectHost}project/${projectAsset.assetId}/update`,
            withCredentials: true
        };
    }
    setAssetHost (assetHost) {
        this.assetHost = assetHost;
    }
    getAssetGetConfig (asset) {
        return `${this.assetHost}${asset.assetId}.${asset.dataFormat}`;
    }
    setTranslatorFunction (translator) {
        this.translator = translator;
        this.cacheDefaultProject();
    }
    cacheDefaultProject () {
        /* const defaultProjectAssets = defaultProject(this.translator);
        defaultProjectAssets.forEach(asset => this.cache(
            this.AssetType[asset.assetType],
            this.DataFormat[asset.dataFormat],
            asset.data,
            asset.id
        ));*/
    }
    getConfigs (){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        PROJECT_SERVER = keyValue.apiUrl ? (`${keyValue.apiUrl}project`) : ITCH_CONFIG.PROJECT_SERVER;
        LOGGED_IN_USER = keyValue.user_id ? keyValue.user_id : 0;
    }

}

const storage = new Storage();

export default storage;
