import request from 'request';
import ITCH_CONFIG from '../../itch.config';
let PROJECT_SERVER = '';
let PROJECT_ID = '';
let PROJECT_USER = 0;
let EXECUTED = false;
let __selectedCostumeIndex = '';
class UpdateAsset{
    constructor () {
        PROJECT_SERVER = '';
        PROJECT_ID = '';
        PROJECT_USER = 0;
        EXECUTED = false;
        __selectedCostumeIndex = '';
        this.getConfigs();
    }
    getConfigs (){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        PROJECT_ID = window.location.hash.substring(1);
        PROJECT_SERVER = keyValue.apiUrl ? (`${keyValue.apiUrl}project`) : ITCH_CONFIG.PROJECT_SERVER;
        PROJECT_USER = keyValue.user_id ? 1 * keyValue.user_id : 0;
    }
    updateAsset (vm, _asset){
        const targets = JSON.parse(vm.toJSON()).targets;
        for (let i = 0; i < targets.length; i++){
            if (targets[i].name === _asset.name){
                const asset = {};
                asset.new_asset = {};
                asset.original_asset = _asset;
                asset.new_asset.costumes = targets[i].costumes;
                asset.new_asset.sounds = targets[i].sounds;
                asset.user_id = PROJECT_USER;
                request.post(`${PROJECT_SERVER}/${PROJECT_ID}/asset/add`, {form: asset}, () => {});
                break;
            }
        }
    }
    uploadProject (vm){
        const targets = JSON.parse(vm.toJSON()).targets;
        let assets = [];
        let sounds = [];
        const soundAssets = [];
        for (let i = 0; i < targets.length; i++){
            if (!targets[i].isStage){
                assets = assets.concat(targets[i].costumes);
                sounds = sounds.concat(targets[i].sounds);
            }
        }
        const assetsIds = {};
        sounds.forEach(sound => {
            if (!assetsIds[sound.assetId]){
                assetsIds[sound.assetId] = true;
                soundAssets.push(sound);
            }
        });
        this.handleNewAsset(vm, assets, 0, 'costume');
        this.handleNewAsset(vm, soundAssets, 0, 'sound');
    }
    handleNewCostume (vm, index){
        __selectedCostumeIndex = index;
        vm.on('targetsUpdate', this.saveNewPaintCostume);
    }
    saveNewPaintCostume (){
        const costume = this.editingTarget.getCostumes()[__selectedCostumeIndex];
        if (!EXECUTED && typeof costume !== 'undefined'){
            EXECUTED = true;
            const asset = {};
            asset.md5 = `${costume.assetId}.${costume.dataFormat}`;
            asset.user_id = PROJECT_USER;
            asset.content = this.getCostume(__selectedCostumeIndex);
            asset.dataFormat = costume.dataFormat;
            request.post(`${PROJECT_SERVER}/${PROJECT_ID}/costume/add`, {form: asset},
                (error, response, body) => {
                    if (body){
                        __selectedCostumeIndex = '';
                    }
                });
        }
    }
    saveNewCostume (vm, selectedCostumeIndex){
        const asset = {};
        const costume = vm.editingTarget.getCostumes()[selectedCostumeIndex];
        asset.md5 = `${costume.assetId}.${costume.dataFormat}`;
        asset.user_id = PROJECT_USER;
        asset.content = vm.getCostume(selectedCostumeIndex);
        asset.dataFormat = costume.dataFormat;
        request.post(`${PROJECT_SERVER}/${PROJECT_ID}/costume/add`, {form: asset}, () => {});
    }
    handleNewAsset (vm, assets, index, type){
        if (index === assets.length){
            return;
        }
        const currentAsset = assets[index];
        const assetId = currentAsset.assetId;
        const url = `${PROJECT_SERVER}/${PROJECT_ID}/${type}/add`;
        const builtinHelper = vm.editingTarget.runtime.storage.builtinHelper;
        const __Asset = vm.editingTarget.runtime.storage.Asset;
        const asset = builtinHelper.get(assetId);
        const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
        const data = {};
        data.user_id = PROJECT_USER;
        data.asset_type = asset.assetType.contentType;
        data.content = a.encodeDataURI(asset.assetType.contentType);
        data.md5 = `${asset.assetId}.${asset.dataFormat}`;
        request.post(url, {form: data}, () => {});
        index++;
        this.handleNewAsset(vm, assets, index, type);
    }
    handleNewSound (vm, sound){
        const assetId = sound.assetId;
        const builtinHelper = vm.editingTarget.runtime.storage.builtinHelper;
        const __Asset = vm.editingTarget.runtime.storage.Asset;
        const asset = builtinHelper.get(assetId);
        const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
        const data = {};
        data.user_id = PROJECT_USER;
        data.asset_type = asset.assetType.contentType;
        data.content = a.encodeDataURI(asset.assetType.contentType);
        data.md5 = `${asset.assetId}.${asset.dataFormat}`;
        request.post(`${PROJECT_SERVER}/${PROJECT_ID}/sound/add`, {form: data}, () => {});
    }
    handleUpdateSound (vm, soundIndex){
        const _this = this;
        let __EXECUTED = false;
        vm.on('targetsUpdate', () => {
            if (!__EXECUTED){
                __EXECUTED = true;
                const sound = vm.editingTarget.sprite.sounds[soundIndex];
                _this.handleNewSound(vm, sound);
            }
        });
    }
    uploadSprite (vm, spriteJSONString){
        const json = JSON.parse(spriteJSONString);
        const builtinHelper = vm.editingTarget.runtime.storage.builtinHelper;
        const __Asset = vm.editingTarget.runtime.storage.Asset;
        const assets = [];
        for (let i = 0; i < json.costumes.length; i++){
            const asset = builtinHelper.get(json.costumes[i].assetId);
            const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
            assets.push({
                md5: `${asset.assetId}.${asset.dataFormat}`,
                content: a.encodeDataURI(asset.assetType.contentType)
            });
        }
        for (let i = 0; i < json.sounds.length; i++){
            const asset = builtinHelper.get(json.sounds[i].assetId);
            const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
            assets.push({
                md5: `${asset.assetId}.${asset.dataFormat}`,
                content: a.encodeDataURI(asset.assetType.contentType)
            });
        }
        const data = {
            assets: assets,
            user_id: PROJECT_USER
        };
        request.post(`${PROJECT_SERVER}/${PROJECT_ID}/sprite/upload`, {form: data}, () => {});
        
    }
}

export default UpdateAsset;
