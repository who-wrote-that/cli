import Parser from 'tree-sitter'
import TreeSitterJava from 'tree-sitter-java'

const parser = new Parser();
parser.setLanguage(TreeSitterJava);

export type Span = {
    from: number;
    to: number;
}

export const findDef = (sourceCode: string, line: number): string => {
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


export const findSpans = (sourceCode: string, def: string): Span[] => {
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
            spans = [...spans, ...auxFindSpans(walker.currentNode.walk(), def)];
        } while (walker.gotoNextSibling());
    }

    return spans;
};