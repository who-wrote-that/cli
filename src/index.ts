#!/usr/bin/env node

import commander from 'commander';
import {codeOwners} from './codeowners';

commander
    .version('Codeowners 0.1.0', '-v, --version')
    .option('--debug', 'enable debug mode', false)
    .option('-d, --depth <number>', 'maximum recursive depth')
    .arguments('<file> <line>')
    .description('...')
    .action((file, line, { debug, depth }) => {
        codeOwners(file, line, depth)
            .then(console.log)
            .catch(console.error);
    });

commander.parse(process.argv);