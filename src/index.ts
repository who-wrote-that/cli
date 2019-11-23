import commander from 'commander'
import {readFile} from './util'
import path from 'path'
import {findSpans, findDef} from './parse'


commander
    .version('Codeowners 0.1.0', '-v, --version')
    .option('-d, --debug', 'enable debug mode')
    .arguments('<file> <line>')
    .description('...')
    .action((file, line, options) => {
        readFile(path.join(process.cwd(), file)).then(data => {
            console.log(findDef(data, line));
            console.log(findSpans(data, 'Test'));

        })
    });

commander.parse(process.argv);