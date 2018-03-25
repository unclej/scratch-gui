import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import request from 'request';
import React from 'react';
import {connect} from 'react-redux';
import ITCH_CONFIG from '../../itch.config';
import Divider from '../components/divider/divider.jsx';
import Button from '../components/button/button.jsx';

import LessonPanelComponent from '../components/lesson-panel/lesson-panel.jsx';
import TextInputComponent from '../components/text-input/text-input.jsx';
import UpdateAsset from '../lib/update-asset';
import styles from '../components/menu-bar/menu-bar.css';
import ShareModal from './share-modal.jsx';
import Lessons from './lessons.jsx';
import LessonsCards from './lessons-cards.jsx';
import {
    nextStep,
    prevStep
} from '../reducers/lessons';

import {
    openShareProject,
    openProjectLessons
} from '../reducers/modals';

class SaveProject extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClick',
            'updateInputValue',
            'getLessons',
            'shareProject',
            'nextLesson',
            'prevLesson',
            'markLessonAsRead',
            'mapLessonsIndexWithId'
        ]);
        const self = this;
        this.PROJECT_SERVER = '';
        this.BASE_URL = '';
        this.CSRF_TOKEN = '';
        this.mapLessonsIds = {};
        this.state = {
            text: 'Saved',
            shareText: 'Share',
            hash_link: '',
            shared: false,
            json: self.props.projectdata,
            projectName: (self.props.projectname === 'Untitled') ? '' : self.props.projectname,
            studioLessons: JSON.parse(self.props.studioLessons),
            lessons: {},
            inputValue: (self.props.projectname === 'Untitled') ? '' : self.props.projectname,
            projectUserId: (typeof self.props.projectuser === 'undefined') ? 0 : self.props.projectuser,
            editingUserId: self.fetchUserId(),
            thumbnail: '',
            old_thumbnail: '',
            md5: self.props.thumbnail,
            createdProject: self.props.createdProject
        };
        this.mapLessonsIndexWithId();
        this.getConfigs();
        setInterval(() => {
            if (!(props.fetchingProject)){
                self.handleClick(true);
                self.takeThumbnail();
            }
        }, 30000);
        if (this.state.projectUserId === this.state.editingUserId){
            setTimeout(() => {
                setInterval(() => {
                    self.checkForUpdate();
                }, 1000);
            }, 5000);
        }
         
    }
    mapLessonsIndexWithId (){
        const self = this;
        const lessons = self.state.studioLessons;
        for (let i = 0; i < lessons.length; i++){
            const lesson = lessons[i];
            self.mapLessonsIds[lesson.id] = i;
        }
    }
    getConfigs (){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        this.PROJECT_SERVER = keyValue.apiUrl ? (`${keyValue.apiUrl}project`) : ITCH_CONFIG.PROJECT_SERVER;
        this.BASE_URL = keyValue.baseUrl ? keyValue.baseUrl : (ITCH_CONFIG.BASE_URL + ITCH_CONFIG.BASE_URL_EXTENSION);
        this.CSRF_TOKEN = keyValue.csrf_token ? keyValue.csrf_token : '';
    }
    checkForUpdate (){
        const self = this;
        if (this.hasUpdates()){
            window.onbeforeunload = function (e) {
                e = e || window.event;
                const message = 'You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page and click Not Saved button to save your work?';
                if (e) {
                    e.returnValue = message;
                }
                return message;
            };
            if (this.state.text === 'Saved') {
                self.setState({text: 'Not Saved'});
            }
        } else {
            window.onbeforeunload = null;
        }
    }
    hasUpdates (){
        return ((this.state.json !== this.props.vm.toJSON() ||
        this.state.projectName !== this.state.inputValue) &&
        this.state.projectUserId === this.state.editingUserId);
    }
    handleClick (autoUpdate) {
        const self = this;
        if (self.hasUpdates()){
            self.setState({text: 'Saving...'});
            const json = this.props.vm.toJSON();
            if (JSON.parse(json).targets.length > 0){

                const currentTargets = JSON.parse(json).targets || [];
                let currentCostumes = [];
                let currentSounds = [];
                const assetIds = {};
                const assets = {};
                currentTargets.forEach(target => {
                    currentCostumes = currentCostumes.concat(target.costumes);
                    currentSounds = currentSounds.concat(target.sounds);
                });
                currentCostumes.forEach(costume => {
                    if (!assetIds[costume.assetId]){
                        assetIds[costume.assetId] = true;
                        const builtinHelper = this.props.vm.editingTarget.runtime.storage.builtinHelper;
                        const __Asset = this.props.vm.editingTarget.runtime.storage.Asset;
                        const asset = builtinHelper.get(costume.assetId);
                        const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
                        assets[`${asset.assetId}.${asset.dataFormat}`] = a.encodeDataURI(asset.assetType.contentType);
                    }
                });
                currentSounds.forEach(sound => {
                    if (!assetIds[sound.assetId]){
                        assetIds[sound.assetId] = true;
                        const builtinHelper = this.props.vm.editingTarget.runtime.storage.builtinHelper;
                        const __Asset = this.props.vm.editingTarget.runtime.storage.Asset;
                        const asset = builtinHelper.get(sound.assetId);
                        const a = new __Asset(asset.assetType, asset.assetId, asset.dataFormat, asset.data);
                        assets[`${asset.assetId}.${asset.dataFormat}`] = a.encodeDataURI(asset.assetType.contentType);
                    }
                });
                const name = self.state.inputValue;
                const form = {};
                form.name = (name === '') ? 'Untitled' : name;
                form.json = JSON.stringify(json);
                form.user_id = self.state.editingUserId;
                form.assets = JSON.stringify(assets);
                if (self.CSRF_TOKEN !== '') {
                    form._token = self.CSRF_TOKEN;
                }
                request.post(`${this.PROJECT_SERVER}/${self.fetchProjectId()}/update`, {
                    form: form
                }, (error, response, body) => {
                    const project = JSON.parse(body);
                    if (project.error){
                        self.setState({text: 'Not Saved'});
                        if (autoUpdate !== true){
                            alert('There was a problem saving your project. Please reload the page or let your teacher know if the problem persists.');// eslint-disable-line no-alert
                        }
                    } else {
                        self.setState({text: 'Saved', json: json, projectName: name});
                    }
                });
            }
            if (this.state.createdProject){
                const lastIndex = this.props.vm.editingTarget.getCostumes().length - 1;
                const update = new UpdateAsset();
                update.saveNewCostume(this.props.vm, lastIndex);
            }
        }
        if (this.state.old_thumbnail !== this.state.thumbnail &&
            this.state.projectUserId === this.state.editingUserId){
            const form = {};
            form.thumbnail = self.state.thumbnail;
            form.user_id = self.state.editingUserId;
            if (self.CSRF_TOKEN !== '') {
                form._token = self.CSRF_TOKEN;
            }
            request.post(`${this.PROJECT_SERVER}/${self.fetchProjectId()}/thumbnail/${self.state.md5}`, {
                form: form
            }, (error, response, body) => {
                const project = JSON.parse(body);
                if (!project.error){
                    self.setState({
                        old_thumbnail: self.state.thumbnail
                    });
                }
            });
        }
    }
    takeThumbnail (){
        if (this.state.projectUserId === this.state.editingUserId){
            const config = {};
            config.backgroundColor = null;
            config.logging = false;
            const self = this;
            const mainCanvas = document.getElementById('mainStageCanvas');
            if (mainCanvas){
                const c = document.createElement('canvas');
                c.width = mainCanvas.width;
                c.height = mainCanvas.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height, 0, 0, c.width, c.height);
                setTimeout(() => {
                    const rgb = self.getAverageRGB(c);
                    if (!((rgb.r === 2 || rgb.r === 0) &&
                    (rgb.g === 2 || rgb.g === 0) &&
                    (rgb.b === 2 || rgb.b === 0))){
                        const imgData = ctx.getImageData(0, 0, c.width, c.height);
                        const data = imgData.data;
                        if (self.state.md5 === ''){
                            const storage = self.props.vm.runtime.storage;
                            const md5 = storage.builtinHelper.cache(
                                storage.AssetType.ImageBitmap,
                                storage.DataFormat.PNG,
                                new Uint8Array(data),
                            );
                            self.setState({md5: `${md5}_${self.fetchProjectId()}.${storage.DataFormat.PNG}`});
                        }
                        self.setState({
                            thumbnail: c.toDataURL()
                        });
                    }
                }, 1000);
            }
        }
        return false;
    }
    getAverageRGB (canvas) {
        const blockSize = 5;
        // only visit every 5 pixels
        const defaultRGB = {r: 0, g: 0, b: 0};
        // for non-supporting envs
        const context = canvas.getContext && canvas.getContext('2d');
        let data;
        let i = -4;
        const rgb = {r: 0, g: 0, b: 0};
        let count = 0;
        if (!context) {
            return defaultRGB;
        }
        const height = canvas.height;
        const width = canvas.width;
        
        try {
            data = context.getImageData(0, 0, width, height);
        } catch (e) {
            /* security error, img on diff domain */// alert('x');
            return defaultRGB;
        }
        
        const length = data.data.length;
        
        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i + 1];
            rgb.b += data.data[i + 2];
        }
        
        // ~~ used to floor values
        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);
        
        return rgb;
        
    }
    fetchProjectId () {
        return window.location.hash.substring(1);
    }
    updateInputValue (evt) {
        if (this.state.projectUserId === this.state.editingUserId){
            if (window.self !== window.top){
                parent.postMessage(
                    ['projectTitleChanged', [evt.target.value]],
                    (this.BASE_URL));
            }
            this.setState({
                inputValue: evt.target.value
            });
        }
    }
    fetchUserId (){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        return keyValue.user_id ? 1 * keyValue.user_id : 0;
    }
    getLessons (){
        this.props.onProjectLessons();
    }
    shareProject (){
        const self = this;
        const form = {};
        if (self.state.shared){
            self.props.onShareProject();
        } else {
            this.setState({
                shareText: 'Sharing...'
            });
            request.post(`${this.PROJECT_SERVER}/${self.fetchProjectId()}/share`, {
                form: form
            }, (error, response, body) => {
                if (body){
                    const data = JSON.parse(body);
                    self.setState({
                        shareText: 'Shared'
                    });
                    if (data.error === false){
                            
                        self.setState({
                            hash_link: data.hash_link,
                            shared: true
                        });
                        self.props.onShareProject();
                    }
                }
            });
        }
    }
    nextLesson (){
        const self = this;
        const callback = function (id){
            self.markLessonAsRead(id);
        };
        this.props.onNextStep(callback);
    }
    prevLesson (){
        const self = this;
        const callback = function (id){
            self.markLessonAsRead(id);
        };
        this.props.onPrevStep(callback);
    }
    markLessonAsRead (id){
        const lessonIndex = this.mapLessonsIds[id];
        if (lessonIndex && this.state.studioLessons[lessonIndex]){
            const studioLessons = this.state.studioLessons;
            studioLessons[lessonIndex].read = true;
            this.setState({
                studioLessons: studioLessons
            });
        }
    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            ...props
        } = this.props;
        let projectHeader = null;
        if (this.state.projectUserId === this.state.editingUserId){
            projectHeader = (
                <React.Fragment>
                    <LessonPanelComponent
                        onClick={this.props.onProjectLessons}
                    >{'Lessons'}</LessonPanelComponent>
                    <Divider className={classNames(styles.divider)} />
                    <TextInputComponent
                        onChange={this.updateInputValue}
                        {...props}
                        value={this.state.inputValue}
                    />
                    <Divider className={classNames(styles.divider)} />
                    <div
                        className={classNames(styles.menuBarItem)}
                        onClick={this.handleClick}
                    >
                        <Button className={classNames(styles.saveButton)}>
                            <span {...props}>{this.state.text}</span>
                        </Button>
                    </div>
                    <Divider className={classNames(styles.divider, (window.top === window ? styles.hidden : ''))} />
                    <div className={classNames([styles.menuBarItem, (window.top === window ? styles.hidden : '')])}>
                        <Button
                            className={classNames(styles.shareButton)}
                            onClick={this.shareProject}
                        >{this.state.shareText}
                        </Button>
                    </div>
                    {this.props.shareProjectVisible ? (
                        <ShareModal hash_link={this.state.hash_link} />
                    ) : null}
                    {this.props.projectLessonsVisible ? (
                        <Lessons
                            lessons={this.state.studioLessons}
                            markLessonAsRead={this.markLessonAsRead}
                        />
                    ) : null}
                    {this.props.lessonsVisible ? (
                        <LessonsCards
                            onNextStep={this.nextLesson}
                            onPrevStep={this.prevLesson}
                        />
                    ) : null}
                </React.Fragment>
            );
        } else {
            projectHeader = (
                <React.Fragment>
                    <TextInputComponent
                        onChange={this.updateInputValue}
                        {...props}
                        disabled
                        value={this.state.inputValue}
                    />
                </React.Fragment>
            );
        }
        return projectHeader;
    }
}
SaveProject.propTypes = {
    onProjectLessons: PropTypes.func.isRequired,
    onShareProject: PropTypes.func.isRequired,
    projectdata: PropTypes.string,
    projectname: PropTypes.string,
    projectuser: PropTypes.number,
    studioLessons: PropTypes.string,
    thumbnail: PropTypes.string
};
const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    lessonsVisible: state.scratchGui.lessons.visible
});
const mapDispatchToProps = dispatch => ({
    onShareProject: () => {
        dispatch(openShareProject());
    },
    onProjectLessons: () => {
        dispatch(openProjectLessons());
    },
    onNextStep: callback => dispatch(nextStep(callback)),
    onPrevStep: callback => dispatch(prevStep(callback))
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SaveProject);
