import Parser from 'tree-sitter';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import { Declaration } from '../types';

const extractClassDeclarationName = (node: Parser.SyntaxNode): string => {
    const indexFirstBrace = node.text.indexOf('{');
    const elements = node.text.substring(0, indexFirstBrace).split(' ');
    return elements.filter(element => element !== '').pop();
};

const extractMethodDefinitionName = (node: Parser.SyntaxNode): string => {
    const indexFirstBracket = node.text.indexOf('(');
    const elements = node.text.substring(0, indexFirstBracket).split(' ');
    return elements.filter(element => element !== '').pop();
};

const fileExtensions = ['js', 'es'];
const parser = TreeSitterJavaScript;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    switch (node.type) {
    case 'class_declaration':
    case 'method_definition':
        return {
            type: node.type,
            name: node.type === 'class_declaration' ?
                extractClassDeclarationName(node) :
                extractMethodDefinitionName(node),
            span: {
                from: node.startPosition.row,
                to: node.endPosition.row
            }
        };
    }
};

export default { fileExtensions, parser, findDeclaration };
