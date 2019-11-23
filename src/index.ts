#!/usr/bin/env node
import commander from 'commander'
import {codeOwners} from './codeowners';

commander
    .version('Codeowners 0.1.0', '-v, --version')
    .option('-d, --debug', 'enable debug mode')
    .arguments('<file> <line>')
    .description('...')
    .action((file, line, options) => {
        codeOwners(file, line)
            .then(console.log)
            .catch(console.error)
    });

commander.parse(process.argv);