import Parser from 'tree-sitter';
import TreeSitterPython from 'tree-sitter-python';
import { Declaration } from '../types';

const extractClassDefinitionName = (node: Parser.SyntaxNode): string => {
    return node.text.replace('class ', '').split(':')[0];
};

const extractFunctionDefinitionName = (node: Parser.SyntaxNode): string => {
    return node.text.replace('def ', '').split('(')[0];
};

const fileExtensions = ['py'];
const parser = TreeSitterPython;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    switch (node.type) {
    case 'class_definition':
    case 'method_definition':
        return {
            type: node.type,
            name: node.type === 'class_definition' ?
                extractClassDefinitionName(node) :
                extractFunctionDefinitionName(node),
            from: node.startPosition.row,
            to: node.endPosition.row
        };
    }
};

export default { fileExtensions, parser, findDeclaration };
