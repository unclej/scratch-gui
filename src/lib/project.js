import request from 'request';
import ITCH_CONFIG from '../../itch.config';

class Project{
    constructor () {
        this.PROJECT_SERVER = '';
        this.PROJECT_ID = '';
        this.PROJECT_USER = 0;
        this.STUDIO_ID = '';
        this.getConfigs();
    }
    getConfigs (){
        const url = window.location.search.substring(1).split('&');
        const keyValue = {};
        for (let i = 0; i < url.length; i++){
            const d = url[i].split('=');
            keyValue[d[0]] = d[1];
        }
        this.PROJECT_ID = window.location.hash.substring(1);
        this.PROJECT_SERVER = keyValue.apiUrl ? (`${keyValue.apiUrl}project`) : ITCH_CONFIG.PROJECT_SERVER;
        this.PROJECT_USER = keyValue.user_id ? 1 * keyValue.user_id : 0;
        this.STUDIO_ID = keyValue.studioID ? 1 * keyValue.studioID : 0;
    }
    markLessonAsRead (lessonId, callback){
        const _this = this;
        if (this.studioID !== 0){
            const data = {};
            data.user_id = _this.PROJECT_USER;
            data.studio_id = _this.STUDIO_ID;
            data.lesson_id = lessonId;
            request.post(`${_this.PROJECT_SERVER}/${_this.PROJECT_ID}/lesson/mark-as-read`, {form: data},
                (error, response, body) => {
                    if (body){
                        const res = JSON.parse(body);
                        if (res.success){
                            callback(lessonId);
                        }
                    }
                });
        }
    }
}
export default Project;
