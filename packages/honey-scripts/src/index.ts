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
        args => {
            //@ts-ignore
            const port: string = String(args._[1]) ?? '3000';

            start(port);
        }
    )
    .command(
        'build',
        'Build the project for production',
        () => {},
        _ => {
            build();
        }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .parse();
