#!/usr/bin/env node

import commander from 'commander';
import {codeOwners} from './codeowners';

commander
    .version('Codeowners 0.1.0', '-v, --version')
    .option('-d, --depth <number>', 'maximum recursive depth')
    .option('-f, --format <format>', 'choose between `pretty` (default) and `data`', 'pretty')
    .arguments('<file> <line>')
    .description('...')
    .action((file, line, {depth, format}) => {
        codeOwners(file, line, depth)
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
                    console.log(
                        result.owners.map(owner => {
                            return `${owner.score} - ${owner.author.name} (${owner.author.email})`;
                        }).join('\n')
                    );
                } else {
                    console.error('`format` must be one of `pretty` or `data`');
                    process.exit(1);
                }
            }).catch(console.error);
    });

commander.parse(process.argv);

if (commander.args.length == 0) {
    console.error('error: missing required arguments \'file\' and \'line\'');
    process.exit(1);
}
