import Parser from 'tree-sitter';
import TreeSitterJava from 'tree-sitter-java';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import TreeSitterGo from 'tree-sitter-go';
import {supportedDeclarations as declarationsJava} from './languages/java';
import {supportedDeclarations as declarationsJavaScript} from './languages/javascript';
import {supportedDeclarations as declarationsGo} from './languages/go';

const parser = new Parser();
let supportedDeclarations = new Map();

const supportedLanguages = new Map([
    ['java', {parser: TreeSitterJava, declarations: declarationsJava}],
    ['js', {parser: TreeSitterJavaScript, declarations: declarationsJavaScript}],
    ['es', {parser: TreeSitterJavaScript, declarations: declarationsJavaScript}],
    ['go', {parser: TreeSitterGo, declarations: declarationsGo}],
]);

export const selectParser = (suffix: string): void => {
    if (!supportedLanguages.has(suffix)) {
        console.error(`language ${suffix} is currently not supported`);
        process.exit(1);
    }
    parser.setLanguage(supportedLanguages.get(suffix).parser);
    supportedDeclarations = supportedLanguages.get(suffix).declarations;
};

export type Span = {
    from: number;
    to: number;
}

export type Declaration = {
    name: string;
    type: string;
}

export const findDeclaration = (suffix: string, sourceCode: string, line: number): Declaration => {
    selectParser(suffix);
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return findDeclarationRec(walker, line);
};

const findDeclarationRec = (walker: Parser.TreeCursor, line: number): Declaration => {
    if (walker.gotoFirstChild()) {
        let nestedMatchingDeclarations = [];

        do {
            if (walker.currentNode.startPosition.row <= line &&
                walker.currentNode.endPosition.row >= line) {
                nestedMatchingDeclarations.push(findDeclarationRec(walker.currentNode.walk(), line));
            }
        } while (walker.gotoNextSibling());
        walker.gotoParent();

        nestedMatchingDeclarations = nestedMatchingDeclarations.filter(decl => decl !== null);
        if (nestedMatchingDeclarations.length == 0) {
            if (supportedDeclarations.has(walker.currentNode.type))
                return supportedDeclarations.get(walker.currentNode.type)(walker.currentNode.text);
            else return null;
        } else if (nestedMatchingDeclarations.length == 1) {
            return nestedMatchingDeclarations[0];
        } else {
            console.error('there should only be one matching declaration given a specific line');
            process.exit(1);
        }
    } else {
        if (supportedDeclarations.has(walker.currentNode.type))
            return supportedDeclarations.get(walker.currentNode.type)(walker.currentNode.text);
        else return null;
    }
};

export const findSpans = (suffix: string, sourceCode: string, declaration: Declaration): Span[] => {
    selectParser(suffix);
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return findSpansRec(walker, declaration);
};

const findSpansRec = (walker: Parser.TreeCursor, declaration: Declaration): Span[] => {
    let spans: Span[] = [];

    if (supportedDeclarations.has(walker.currentNode.type)) {
        const declarationAtNode = supportedDeclarations.get(walker.currentNode.type)(walker.currentNode.text);
        if (declarationAtNode.name === declaration.name &&
            declarationAtNode.type === declaration.type
        ) {
            spans = [{
                from: walker.currentNode.startPosition.row,
                to: walker.currentNode.endPosition.row
            }];
        }
    }

    if (walker.gotoFirstChild()) {
        do {
            spans = [...spans, ...findSpansRec(walker.currentNode.walk(), declaration)];
        } while (walker.gotoNextSibling());
    }

    return spans;
};
