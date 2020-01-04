import TreeSitter, {SyntaxNode} from 'tree-sitter';
import { Declaration, Span } from './types';
import { Language } from './languages/types';

export default class Parser {
    lang: Language;
    parser: TreeSitter;

    constructor(lang: Language) {
        this.lang = lang;

        this.parser = new TreeSitter();
        this.parser.setLanguage(lang.parser);
    }

    parse(sourceCode: string): TreeSitter.SyntaxNode {
        return this.parser.parse(sourceCode).rootNode;
    }

    findDeclarationByName(
        node: TreeSitter.SyntaxNode, name: string
    ): Declaration {
        const decl = this.lang.findDeclaration(node);
        if (decl && decl.name === name) return decl;

        for (const child of node.namedChildren) {
            const newDecl = this.findDeclarationByName(child, name);
            if (newDecl) return newDecl;
        }

        return decl;
    }

    findDeclarationByLine(
        node: TreeSitter.SyntaxNode,
        line: number
    ): Declaration {
        return node.namedChildren
            .filter(child => {
                return child.startPosition.row <= line &&
                    child.endPosition.row >= line;
            })
            .map(child => this.findDeclarationByLine(child, line))
            .filter(decl => decl !== null)
            .shift() || this.lang.findDeclaration(node);
    }

    findSpans(node: TreeSitter.SyntaxNode, decl: Declaration): Span[] {
        const nestedSpans =
            node.namedChildren.map(child => this.findSpans(child, decl)).flat();
        const declAtNode = this.lang.findDeclaration(node);

        if (
            declAtNode &&
            declAtNode.name === decl.name &&
            declAtNode.type === decl.type
        ) return [{
            from: node.startPosition.row,
            to: node.endPosition.row
        }, ...nestedSpans];
        else return nestedSpans;
    }
}
