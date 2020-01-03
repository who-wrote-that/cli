import Parser from 'tree-sitter';
import TreeSitterJava from 'tree-sitter-java';
import { Declaration } from '../types';

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
