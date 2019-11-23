import commander from 'commander'
import Parser from 'tree-sitter'
import TreeSitterJava from 'tree-sitter-java'
import {readFile} from './util'
import path from 'path'

const parser = new Parser();
parser.setLanguage(TreeSitterJava);

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

type Span = {
    from: number;
    to: number;
}

const findDef = (sourceCode: string, line: number): string => {
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return auxFindDef(walker, line);
};

const auxFindDef = (walker: Parser.TreeCursor, line: number): string => {
    if (walker.currentNode.type === 'method_declaration') return extractDef(walker.currentNode.text);

    if (walker.gotoFirstChild()) {
        do {
            if (walker.currentNode.startPosition.row <= line &&
                walker.currentNode.endPosition.row >= line) {
                return auxFindDef(walker, line)
            }
        } while (walker.gotoNextSibling());
        console.log('outside method declaration');
        process.exit(1);
    } else {
        console.log('outside method declaration');
        process.exit(1);
    }
};

const extractDef = (text: string): string => {
    const indexFirstBracket = text.indexOf('(');
    const elements = text.substring(0, indexFirstBracket).split(' ');
    return elements.pop();
};


const findSpans = (sourceCode: string, def: string): Span[] => {
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return auxFindSpans(walker, def);
};

const auxFindSpans = (walker: Parser.TreeCursor, def: string): Span[] => {
    if (walker.currentNode.type === 'method_declaration') {
        if (extractDef(walker.currentNode.text) === def) {
            return [{
                from: walker.currentNode.startPosition.row,
                to: walker.currentNode.endPosition.row
            }]
        } else return []
    }

    let spans: Span[] = [];

    if (walker.gotoFirstChild()) {
        do {
            spans = [...spans, ...auxFindSpans(walker, def)];
        } while (walker.gotoNextSibling());
    }

    return spans;
};
