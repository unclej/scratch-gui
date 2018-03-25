import PropTypes from 'prop-types';
import React from 'react';
import {setFullScreen} from '../reducers/stage-size';
import ITCH_CONFIG from '../../itch.config';
class EventMessage extends React.Component {
    constructor (props) {
        super(props);
        
        window.addEventListener('message', function(event) {
            //Check the origin of the data!
            var url = window.location.search.substring(1).split('&');
            var keyValue={};
            for(var i = 0; i<url.length; i++){
                var d = url[i].split('=');
                keyValue[d[0]] = d[1];
            }
            var origin = ITCH_CONFIG.BASE_URL;
            if(typeof keyValue['baseUrl'] !== "undefined"){
                var arr = keyValue['baseUrl'].split("/");
                origin = arr[0] + "//" + arr[2];
            }
            if (~event.origin.indexOf(origin)) {
                var data = event.data;
                if(data.length ==2){
                    var function_name = data[0];
                    var function_param = data[1];
                    switch(function_name){
                        case"setFullScreen":
                            var btn =document.getElementById('scratch-header-fullscreen-btn');
                            if(btn)
                                btn.click();
                            break;
                        case"setSizes":
                            var html = document.getElementsByTagName('html')[0];
                            if(function_param[0] < 380){
                                function_param[0] = 380;
                            }
                            if(function_param[1] < 334){
                                function_param[1] = 334;
                            }
                            var isFullscreen = function_param[2]
                            html.style.width = function_param[0]+"px";
                            html.style.height = function_param[1]+"px";
                            var canvas = document.getElementById("mainStageCanvas");
                            var parentofCanvas = document.getElementById("parentOfMainStageCanvas");
                            if(isFullscreen === false && canvas !== null){
                                var canvasWidth = function_param[0] * 0.94;
                                var canvasHeight = function_param[1] * 0.94;
                                if(canvasHeight > (canvas.parentElement.offsetHeight - 10)){
                                    canvasHeight = canvas.parentElement.offsetHeight - 10;
                                }
                                canvas.style.width = canvasWidth+"px";
                                canvas.style.height = canvasHeight+"px";
                                if(parentofCanvas){
                                    var parentWidth = function_param[0];
                                    var parentHeight = function_param[1] - 40;
                                    parentofCanvas.style.minWidth = parentWidth+"px";
                                    parentofCanvas.style.minHeight = parentHeight+"px";
                                }
                            }
                            window.dispatchEvent(new Event('resize'));
                            setTimeout(() => {
                                window.dispatchEvent(new Event('resize'));
                            }, 200);
                            break;
                        default:
                            break;
                    }

                }
            } else { 
                // The data hasn't been sent from our site! 
                // Be careful! Do not use it.
                return; 
            } 
        });
    }
}

const event = new EventMessage();
export default event;