import TreeSitterTSX from 'tree-sitter-typescript/tsx';
import { findDeclaration } from './util';

const NODE_TYPES = Object.freeze([
    'class',
    'class_declaration',
    'function',
    'function_declaration',
    'generator_function',
    'generator_function_declaration',
    'method_definition',
    'jsx_opening_element',
    'jsx_closing_element',
]);

const fileExtensions = ['tsx'];
const parser = TreeSitterTSX;

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
