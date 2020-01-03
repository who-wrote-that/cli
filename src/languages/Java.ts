import Parser from 'tree-sitter';
import TreeSitterJava from 'tree-sitter-java';
import { Declaration } from '../types';
import { findDeclaration } from './util';

const NODE_TYPES = Object.freeze([
    'marker_annotation',
    'annotation',
    'enum_declaration',
    'enum_constant',
    'class_declaration',
    'annotation_type_declaration',
    'annotation_type_element_declaration',
    'interface_declaration',
    'constructor_declaration',
    'method_declaration'
]);

const fileExtensions = ['java'];
const parser = TreeSitterJava;

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
