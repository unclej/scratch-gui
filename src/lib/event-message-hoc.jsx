import React from 'react';
import ITCH_CONFIG from '../../itch.config';
class EventMessage extends React.Component {
    constructor (props) {
        super(props);
            
        window.addEventListener('message', event => {
            // Check the origin of the data!
            const url = window.location.search.substring(1).split('&');
            const keyValue = {};
            for (let i = 0; i < url.length; i++){
                const d = url[i].split('=');
                keyValue[d[0]] = d[1];
            }
            let origin = ITCH_CONFIG.BASE_URL;
            if (typeof keyValue.baseUrl !== 'undefined'){
                const arr = keyValue.baseUrl.split('/');
                origin = `${arr[0]}//${arr[2]}`;
            }
            if (~event.origin.indexOf(origin)) {
                const data = event.data;
                if (data.length === 2){
                    const functionName = data[0];
                    const functionParam = data[1];
                    switch (functionName){
                    case 'setFullScreen': {
                        const btn = document.getElementById('scratch-header-fullscreen-btn');
                        if (btn) {
                            btn.click();
                        }
                        break;
                    }
                    case 'setSizes': {
                        const html = document.getElementsByTagName('html')[0];
                        if (functionParam[0] < 380){
                            functionParam[0] = 380;
                        }
                        if (functionParam[1] < 334){
                            functionParam[1] = 334;
                        }
                        const isFullscreen = functionParam[2];
                        html.style.width = `${functionParam[0]}px`;
                        html.style.height = `${functionParam[1]}px`;
                        const canvas = document.getElementById('mainStageCanvas');
                        const parentofCanvas = document.getElementById('parentOfMainStageCanvas');
                        if (isFullscreen === false && canvas !== null){
                            const canvasWidth = functionParam[0] * 0.94;
                            let canvasHeight = functionParam[1] * 0.94;
                            if (canvasHeight > (canvas.parentElement.offsetHeight - 10)){
                                canvasHeight = canvas.parentElement.offsetHeight - 10;
                            }
                            canvas.style.width = `${canvasWidth}px`;
                            canvas.style.height = `${canvasHeight}px`;
                            if (parentofCanvas){
                                const parentWidth = functionParam[0];
                                const parentHeight = functionParam[1] - 40;
                                parentofCanvas.style.minWidth = `${parentWidth}px`;
                                parentofCanvas.style.minHeight = `${parentHeight}px`;
                            }
                        }
                        window.dispatchEvent(new Event('resize'));
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                        }, 200);
                        break;
                    }
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

const EventMessageHOC = new EventMessage();
export default EventMessageHOC;
