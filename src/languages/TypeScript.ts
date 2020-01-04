import TreeSitterTypeScript from 'tree-sitter-typescript/typescript';
import { findDeclaration } from './util';

const NODE_TYPES = Object.freeze([
    'class',
    'class_declaration',
    'function',
    'function_declaration',
    'generator_function',
    'generator_function_declaration',
    'method_definition',
]);

const fileExtensions = ['ts'];
const parser = TreeSitterTypeScript;

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
