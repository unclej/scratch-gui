import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import popWav from '!arraybuffer-loader!./83a9787d4cb6f3b7632b4ddfebf74367.wav';
import ballWav from '!arraybuffer-loader!./53a3c2e27d1fb5fdb14aaf0cb41e7889.wav';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import costume1 from '!raw-loader!./10117ddaefa98d819f2b1df93805622f.svg';
import costume2 from '!raw-loader!./6e6330cad7750ea7e9dc88402661deb8.svg';
import costume3 from '!raw-loader!./bb45ed5db278f15c17c012c34a6b160f.svg';
import costume4 from '!raw-loader!./5d494659deae5c0de06b5885f5524276.svg';
import costume5 from '!raw-loader!./e80c98bc62fd32e8df81642af11ffb1a.svg';
/* eslint-enable import/no-unresolved */

const defaultProject = translator => {
    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        /* global TextEncoder */
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: '83a9787d4cb6f3b7632b4ddfebf74367',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(popWav)
    }, {
        id: '53a3c2e27d1fb5fdb14aaf0cb41e7889',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(ballWav)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: 'b7853f557e4426412e64bb3da6531a99',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume1)
    }, {
        id: '6e6330cad7750ea7e9dc88402661deb8',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume2)
    }, {
        id: 'bb45ed5db278f15c17c012c34a6b160f',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume3)
    }, {
        id: '5d494659deae5c0de06b5885f5524276',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume4)
    }, {
        id: 'e80c98bc62fd32e8df81642af11ffb1a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume5)
    }];
};

export default defaultProject;
