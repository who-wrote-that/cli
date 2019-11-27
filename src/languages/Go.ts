import Parser from 'tree-sitter';
import TreeSitterGo from 'tree-sitter-go';
import { Declaration } from '../types';

const extractTypeDeclarationName = (node: Parser.SyntaxNode): string => {
    return node.text.replace('type ', '').split(' ')[0];
};

const extractFunctionDeclarationName = (node: Parser.SyntaxNode): string => {
    return node.text.replace('func ', '').split(' ')[0];
};

const fileExtensions = ['go'];
const parser = TreeSitterGo;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    switch (node.type) {
    case 'type_declaration':
    case 'function_declaration':
        return {
            type: node.type,
            name: node.type === 'type_declaration' ?
                extractTypeDeclarationName(node) :
                extractFunctionDeclarationName(node),
            from: node.startPosition.row,
            to: node.endPosition.row
        };
    }
};

export default { fileExtensions, parser, findDeclaration };
