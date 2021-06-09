import {defineMessages} from 'react-intl';
import sharedMessages from '../shared-messages';

let messages = defineMessages({
    boing: {
        defaultMessage: 'Boing',
        description: 'Name for the meow sound',
        id: 'gui.defaultProject.meow'
    },
    variable: {
        defaultMessage: 'my variable',
        description: 'Name for the default variable',
        id: 'gui.defaultProject.variable'
    }
});

messages = {...messages, ...sharedMessages};

// use the default message if a translation function is not passed
const defaultTranslator = msgObj => msgObj.defaultMessage;

/**
 * Generate a localized version of the default project
 * @param {function} translateFunction a function to use for translating the default names
 * @return {object} the project data json for the default project
 */
const projectData = translateFunction => {
    const translator = translateFunction || defaultTranslator;
    return ({
        targets: [
            {
                isStage: true,
                name: 'Stage',
                variables: {
                    '`jEk@4|i[#Fk?(8x)AV.-my variable': [
                        translator(messages.variable),
                        0
                    ]
                },
                lists: {},
                broadcasts: {},
                blocks: {},
                currentCostume: 0,
                costumes: [
                    {
                        assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
                        name: translator(messages.backdrop, {index: 1}),
                        md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 240,
                        rotationCenterY: 180
                    }
                ],
                sounds: [
                    {
                        assetId: '83a9787d4cb6f3b7632b4ddfebf74367',
                        name: translator(messages.pop),
                        dataFormat: 'wav',
                        format: '',
                        rate: 11025,
                        sampleCount: 258,
                        md5ext: '83a9787d4cb6f3b7632b4ddfebf74367.wav'
                    }
                ],
                volume: 100
            },
            {
                isStage: false,
                name: translator(messages.sprite, {index: 1}),
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                currentCostume: 0,
                costumes: [
                    {
                        assetId: '10117ddaefa98d819f2b1df93805622f',
                        name: translator(messages.costume, {index: 1}),
                        bitmapResolution: 1,
                        md5ext: '10117ddaefa98d819f2b1df93805622f.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 22,
                        rotationCenterY: 22
                    },
                    {
                        assetId: '6e6330cad7750ea7e9dc88402661deb8',
                        name: translator(messages.costume, {index: 2}),
                        bitmapResolution: 1,
                        md5ext: '6e6330cad7750ea7e9dc88402661deb8.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 22,
                        rotationCenterY: 22
                    },
                    {
                        assetId: 'bb45ed5db278f15c17c012c34a6b160f',
                        name: translator(messages.costume, {index: 3}),
                        bitmapResolution: 1,
                        md5ext: 'bb45ed5db278f15c17c012c34a6b160f.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 22,
                        rotationCenterY: 22
                    },
                    {
                        assetId: '5d494659deae5c0de06b5885f5524276',
                        name: translator(messages.costume, {index: 4}),
                        bitmapResolution: 1,
                        md5ext: '5d494659deae5c0de06b5885f5524276.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 22,
                        rotationCenterY: 22
                    },
                    {
                        assetId: 'e80c98bc62fd32e8df81642af11ffb1a',
                        name: translator(messages.costume, {index: 5}),
                        bitmapResolution: 1,
                        md5ext: 'e80c98bc62fd32e8df81642af11ffb1a.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 22,
                        rotationCenterY: 22
                    }
                ],
                sounds: [
                    {
                        assetId: '53a3c2e27d1fb5fdb14aaf0cb41e7889',
                        name: translator(messages.boing),
                        dataFormat: 'wav',
                        format: '',
                        rate: 22050,
                        sampleCount: 6804,
                        md5ext: '53a3c2e27d1fb5fdb14aaf0cb41e7889.wav'
                    }, {
                        assetId: '83a9787d4cb6f3b7632b4ddfebf74367',
                        name: translator(messages.pop),
                        dataFormat: 'wav',
                        format: '',
                        rate: 11025,
                        sampleCount: 258,
                        md5ext: '83a9787d4cb6f3b7632b4ddfebf74367.wav'
                    }
                ],
                volume: 100,
                visible: true,
                x: 0,
                y: 0,
                size: 100,
                direction: 90,
                draggable: false,
                rotationStyle: 'all around'
            }
        ],
        meta: {
            semver: '3.0.0',
            vm: '0.1.0',
            agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' // eslint-disable-line max-len
        }
    });
};


export default projectData;
