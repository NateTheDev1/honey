#!/usr/bin/env node

const script = process.argv[2];

switch (script) {
    case 'start':
        require('../scripts/start');
        break;
    case 'build':
        require('../scripts/build');
        break;
    default:
        console.log('Unknown script "' + script + '".');
        break;
}
