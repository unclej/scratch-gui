#!/usr/bin/env node
/* eslint-disable no-console */

const jsonfile = require('jsonfile');
const pkg = require('../package.json');

console.log('Writing package.json ...');
delete pkg.devDependencies;
const packageJson = {
    ...pkg,
    main: './scratch-gui.js'
};

jsonfile.writeFileSync('dist/package.json', packageJson, {spaces: 2, EOL: '\r\n'});
