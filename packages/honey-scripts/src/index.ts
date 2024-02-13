#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import start from './commands/start';
import build from './commands/build';
import { sitemap } from './commands/sitemap';

yargs(hideBin(process.argv))
    .command(
        'start',
        'Start the development server',
        yargs => {
            yargs.option('port', {
                alias: 'p',
                describe: 'Port to start the server on',
                default: 3000,
                type: 'number',
                demandOption: true
            });
        },
        args => {
            const port = String(args.port ?? 3000); // No need for ?? '3000', default is handled by yargs
            start(port); // Ensuring port is passed as a string if required by the start function
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
    .command(
        'sitemap',
        'Generate a sitemap for the project.',
        yargs => {
            yargs
                .option('path', {
                    alias: 'p',
                    describe: 'Base path for the sitemap',
                    type: 'string',
                    demandOption: true // Makes sure the path is always provided
                })
                .option('ignoreDynamicRoutes', {
                    alias: 'i',
                    describe: 'Ignore dynamic routes',
                    type: 'boolean',
                    default: false
                });
        },
        args => {
            console.log('Generating sitemap...');
            console.log(args, args.ignoreDynamicRoutes);
            sitemap(args.path as string, args.ignoreDynamicRoutes as boolean); // Assuming sitemap function can accept the new parameter
        }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .parse();
