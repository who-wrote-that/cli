#!/usr/bin/env node

import commander from 'commander';
import {codeOwners} from './codeowners';

commander
    .version('Codeowners 0.1.0', '-v, --version')
    .option('-d, --depth <number>', 'Maximum recursive depth.', value => {
        if (value >= 0) {
            return value;
        } else {
            console.error('`depth` may not be negative');
            process.exit(1);
        }
    })
    .option('-f, --format <format>', 'Output format. Choose between `\'pretty\'` (default) and `\'data\'`.', value => {
        if (['pretty', 'data'].includes(value)) {
            return value;
        } else {
            console.error('`format` must be one of `\'pretty\'` or `\'data\'`');
            process.exit(1);
        }
    }, 'pretty')
    .option('-s, --strategy <strategy>', 'Strategy to be used to evaluate codeowners. Choose between `\'weighted-lines\'` (default) and `\'lines\'`', value => {
        if (['weighted-lines', 'lines'].includes(value)) {
            return value;
        } else {
            console.error('`strategy` must be one of `\'weighted-lines\'` or `\'lines\'`');
            process.exit(1);
        }
    }, 'weighted-lines')
    .arguments('<file> <line>')
    .description('...')
    .action((file, line, {depth, format, strategy}) => {
        codeOwners(file, line, depth, strategy)
            .then(result => {
                if (format === 'data') {
                    console.dir(result, {depth: null});
                } else if (format === 'pretty') {
                    if (result.def) {
                        console.log(`${result.def.name} :: ${result.def.type}\n`);
                    } else {
                        console.error('Given line number does not yield a supported declaration');
                        process.exit(1);
                    }

                    if (result.owners.length > 0) {
                        console.log(
                            result.owners.map(owner => {
                                return `${owner.score} - ${owner.author.name} (${owner.author.email})`;
                            }).join('\n')
                        );
                    } else {
                        console.error('No one can claim ownership over this definition!');
                        process.exit(1);
                    }
                }
            }).catch(console.error);
    });

commander.parse(process.argv);

if (commander.args.length == 0) {
    console.error('error: missing required arguments \'file\' and \'line\'');
    process.exit(1);
}
