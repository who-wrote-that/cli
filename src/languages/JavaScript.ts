import Parser from 'tree-sitter';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import { Declaration } from '../types';
import { findDeclaration } from './util';

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

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
