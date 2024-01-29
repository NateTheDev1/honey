#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import start from './commands/start';
import build from './commands/build';

yargs(hideBin(process.argv))
    .command(
        'start',
        'Start the development server',
        () => {},
        argv => {
            console.log('argv', argv);
            start();
        }
    )
    .command(
        'build',
        'Build the project for production',
        () => {},
        argv => {
            console.log('argv', argv);
            build();
        }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .parse();
