import Parser from 'tree-sitter';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import { Declaration } from '../types';

const NODE_TYPES = Object.freeze([
    'jsx_opening_element',
    'jsx_closing_element',
    'jsx_self_closing_element',
    'class',
    'class_declaration',
    'function',
    'function_declaration',
    'generator_function',
    'generator_function_declaration',
    'method_definition',
]);

const fileExtensions = ['js', 'jsx', 'es'];
const parser = TreeSitterJavaScript;

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
