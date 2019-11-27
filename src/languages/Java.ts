import Parser from 'tree-sitter';
import TreeSitterJava from 'tree-sitter-java';
import { Declaration } from '../types';

const extractClassDeclarationName = (node: Parser.SyntaxNode): string => {
    const indexClassToken = node.text.indexOf('class');
    const elements = node.text.substring(indexClassToken + 6).split(' ');
    return elements.filter(element => element !== '').shift();
};

const extractMethodDeclarationName = (node: Parser.SyntaxNode): string => {
    const text = node.text.split('\n')
        .filter(line => !line.trim().startsWith('@')).join('\n');
    const indexFirstBracket = text.indexOf('(');
    const elements = text.substring(0, indexFirstBracket).split(' ');
    return elements.filter(element => element !== '').pop();
};

const fileExtensions = ['java'];
const parser = TreeSitterJava;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    switch (node.type) {
    case 'class_declaration':
    case 'method_declaration':
        return {
            type: node.type,
            name: node.type === 'class_declaration' ?
                extractClassDeclarationName(node) :
                extractMethodDeclarationName(node),
            from: node.startPosition.row,
            to: node.endPosition.row
        };
    }
};

export default { fileExtensions, parser, findDeclaration };
