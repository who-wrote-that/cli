import Parser from 'tree-sitter';
import TreeSitterPython from 'tree-sitter-python';
import { Declaration } from '../types';

const NODE_TYPES = Object.freeze([
    'function_definition',
    'class_definition',
]);

const fileExtensions = ['py'];
const parser = TreeSitterPython;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    if (NODE_TYPES.includes(node.type))
        return {
            type: node.type,
            name: node.nameNode.text,
            span: {
                from: node.startPosition.row,
                to: node.endPosition.row
            }
        };
};

export default { fileExtensions, parser, findDeclaration };
