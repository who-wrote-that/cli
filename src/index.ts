#!/usr/bin/env node

import commander from 'commander';
import chalk from 'chalk';
import {codeOwnersByLine, codeOwnersByDefName} from './codeowners';
import {Owner} from './git';
import {Declaration} from './parse';

const validateDepth = (value: number): number => {
    if (value >= 0) {
        return value;
    } else {
        console.error('`depth` may not be negative');
        process.exit(1);
    }
};

const validateFormat = (value: string): string => {
    if (['pretty', 'data', 'json'].includes(value)) {
        return value;
    } else {
        console.error('`format` must be one of `\'pretty\'`, `\'data\'` or `\'json\'`');
        process.exit(1);
    }
};

const validateStrategy = (value: string): string => {
    if (['weighted-lines', 'lines'].includes(value)) {
        return value;
    } else {
        console.error('`strategy` must be one of `\'weighted-lines\'` or `\'lines\'`');
        process.exit(1);
    }
};

const handleResult = (result: {def: Declaration; owners: Owner[]}, format: string): void => {
    if (format === 'data') {
        console.dir(result, {depth: null});
    } else if (format === 'json') {
        console.log(JSON.stringify(result));
    } else if (format === 'pretty') {
        if (result.def) {
            console.log(`${chalk.underline.bold(result.def.name)} ${chalk.gray(':: ' + result.def.type)}`);
        } else {
            console.error('Given line number does not yield a supported declaration');
            process.exit(1);
        }

        if (result.owners.length > 0) {
            console.log(
                result.owners.map(owner => {
                    return `  ${owner.score}\t - ${owner.author.name} (${owner.author.email})`;
                }).join('\n')
            );
        } else {
            console.error('No one can claim ownership over this definition!');
            process.exit(1);
        }
    }
};

commander
    .version('Codeowners 0.1.0', '-v, --version');

commander
    .command('line <file> <line>')
    .option('-d, --depth <number>', 'Maximum recursive depth.', validateDepth)
    .option('-f, --format <format>', 'Output format. Choose between `\'pretty\'` (default), `\'data\'` and `\'json\'`.', validateFormat, 'pretty')
    .option('-s, --strategy <strategy>', 'Strategy to be used to evaluate codeowners. Choose between `\'weighted-lines\'` (default) and `\'lines\'`', validateStrategy, 'weighted-lines')
    .description('Lookup code owners for a specific line of a file.')
    .action((file, line, {depth, format, strategy}) => {
        codeOwnersByLine(file, line - 1, depth, strategy)
            .then(result => handleResult(result, format))
            .catch(console.error);
    });

commander
    .command('def <file> <definition>')
    .option('-d, --depth <number>', 'Maximum recursive depth.', validateDepth)
    .option('-f, --format <format>', 'Output format. Choose between `\'pretty\'` (default), `\'data\'` and `\'json\'`.', validateFormat, 'pretty')
    .option('-s, --strategy <strategy>', 'Strategy to be used to evaluate codeowners. Choose between `\'weighted-lines\'` (default) and `\'lines\'`', validateStrategy, 'weighted-lines')
    .description('Lookup code owners given a definition inside a file.')
    .action((file, defName, {depth, format, strategy}) => {
        codeOwnersByDefName(file, defName, depth, strategy)
            .then(result => handleResult(result, format))
            .catch(console.error);
    });

commander.parse(process.argv);

if (commander.args.length == 0) commander.help();
