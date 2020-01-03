import Parser from 'tree-sitter';
import TreeSitterPython from 'tree-sitter-python';
import { Declaration } from '../types';
import { findDeclaration } from './util';

const NODE_TYPES = Object.freeze([
    'function_definition',
    'class_definition',
]);

const fileExtensions = ['py'];
const parser = TreeSitterPython;

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
