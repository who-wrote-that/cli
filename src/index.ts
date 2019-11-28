#!/usr/bin/env node

import Program from 'commander';
import chalk from 'chalk';
import { CodeOwners, Format, Strategy } from './types';
import WhoWroteThat from './WhoWroteThat';

const VERSION = '0.1.0';

const validate = (valid: (value: any) => boolean, message: string) =>
    (value: any): any =>
        valid(value) ? value : fail(message);

const fail = (error: string): void => {
    if (Program.format === Format.JSON)
        console.error(JSON.stringify({ error }));
    else
        console.error(error);

    process.exit(1);
};

const handleResult = (result: CodeOwners): void => {
    if (Program.format === Format.DATA) {
        console.dir(result, { depth: null });
    } else if (Program.format === Format.JSON) {
        console.log(JSON.stringify(result));
    } else if (Program.format === Format.PRETTY) {
        if (result.declaration)
            console.log(
                `${chalk.underline.bold(result.declaration.name)} ` +
                    `${chalk.gray(':: ' + result.declaration.type)}`
            );
        else
            fail('Given line number does not yield a supported declaration');

        if (result.owners.length > 0) {
            console.log(
                result.owners.map(owner => {
                    return `  ${owner.score}\t - ${owner.author.name} ` +
                        `(${owner.author.email})`;
                }).join('\n')
            );
        } else {
            fail('No one can claim ownership over this definition!');
        }
    }
};

Program
    .version(`Who Wrote That ${VERSION}`, '-v, --version')
    .description('Lookup code owners of classes, methods and more.')
    .option(
        '-d, --depth <number>',
        'maximum recursive depth',
        validate((value: number) => value > 0, '`depth` has to be positive')
    )
    .option(
        '-f, --format <pretty|data|json>',
        'output format',
        validate(
            (value: Format) => Object.values(Format).includes(value),
            '`format` must be one of `pretty`, `data` or `json`'
        ),
        Format.PRETTY
    )
    .option(
        '-s, --strategy <weighted-lines|lines>',
        'strategy to be used to evaluate code owners',
        validate(
            (value: Strategy) => Object.values(Strategy).includes(value),
            '`strategy` must be one of `weighted-lines` or `lines`'
        ),
        Strategy.WEIGHTED_LINES
    );

Program
    .command('decl <file> <name>')
    .description('Lookup code owners of a given declaration inside a file.')
    .action((file, name) => {
        new WhoWroteThat(file, Program.depth, Program.strategy, fail)
            .decl(name)
            .then(handleResult)
            .catch(fail);
    });

Program
    .command('line <file> <line>')
    .description(
        'Lookup code owners of a declaration on a given line of a file.'
    )
    .action((file, line) => {
        new WhoWroteThat(file, Program.depth, Program.strategy, fail)
            .line(line - 1)
            .then(handleResult)
            .catch(fail);
    });

Program.parse(process.argv);

if (Program.args.length == 0) Program.help();
