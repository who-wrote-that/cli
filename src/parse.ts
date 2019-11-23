import Parser from 'tree-sitter';
import TreeSitterJava from 'tree-sitter-java';
import {supportedDeclarations} from './languages/java';

const parser = new Parser();
parser.setLanguage(TreeSitterJava);

export type Span = {
    from: number;
    to: number;
}

export type Declaration = {
    name: string,
    type: string,
}

export const findDeclaration = (sourceCode: string, line: number): Declaration => {
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return auxFindDeclaration(walker, line);
};

const auxFindDeclaration = (walker: Parser.TreeCursor, line: number): Declaration => {
    if (walker.gotoFirstChild()) {
        let nestedMatchingDeclarations = [];

        do {
            if (walker.currentNode.startPosition.row <= line &&
                walker.currentNode.endPosition.row >= line) {
                nestedMatchingDeclarations.push(auxFindDeclaration(walker, line));
            }
        } while (walker.gotoNextSibling());

        nestedMatchingDeclarations = nestedMatchingDeclarations.filter(decl => decl != null);
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


export const findSpans = (sourceCode: string, declaration: Declaration): Span[] => {
    const root = parser.parse(sourceCode);
    const walker = root.walk();
    return auxFindSpans(walker, declaration);
};

const auxFindSpans = (walker: Parser.TreeCursor, declaration: Declaration): Span[] => {
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
            spans = [...spans, ...auxFindSpans(walker.currentNode.walk(), declaration)];
        } while (walker.gotoNextSibling());
    }

    return spans;
};