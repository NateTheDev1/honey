#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

const deps: string[] = ['honey'];
const devDeps: string[] = ['babel-preset-honey'];

function createApp(appName: string, jsType: 'ts' | 'js') {
    const appDirectory = path.resolve(process.cwd(), appName);
    fs.mkdirSync(appDirectory); // Create the app directory

    // Copy template files to appDirectory...
    const templateDirectory = path.resolve(
        __dirname,
        '..',
        'templates',
        jsType === 'ts' ? 'default' : 'js-only'
    );

    const filesToCreate = fs.readdirSync(templateDirectory);

    filesToCreate.forEach(file => {
        const origFilePath = path.resolve(templateDirectory, file);
        const stats = fs.statSync(origFilePath);

        if (stats.isFile()) {
            const contents = fs.readFileSync(origFilePath, 'utf8');

            const writePath = path.resolve(appDirectory, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        }
    });

    // Install dependencies
    child_process.execSync('yarn install && yarn add ' + deps.join(' '), {
        cwd: appDirectory,
        stdio: 'inherit'
    });

    // Install devDependencies
    child_process.execSync('yarn add -D ' + devDeps.join(' '), {
        cwd: appDirectory,
        stdio: 'inherit'
    });

    // Initialize git repository
    child_process.execSync('git init', {
        cwd: appDirectory,
        stdio: 'inherit'
    });

    child_process.execSync('git branch -m main', {
        cwd: appDirectory,
        stdio: 'inherit'
    });

    console.log(`Honey app ${appName} created successfully.`);
}

function main() {
    const appName = process.argv[2];

    const jsType: 'ts' | 'js' =
        process.argv[3] === '--javascript' ? 'js' : 'ts';

    if (!appName) {
        console.error('Please specify the app name');
        process.exit(1);
    }

    if (fs.existsSync(appName)) {
        console.error(`Directory ${appName} already exists`);
        process.exit(1);
    }

    createApp(appName, jsType);
}

main();
