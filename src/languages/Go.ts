import Parser from 'tree-sitter';
import TreeSitterGo from 'tree-sitter-go';
import { Declaration } from '../types';

const NODE_TYPES = Object.freeze([
    'function_declaration',
    'method_declaration',
    'type_alias',
    'field_declaration',
    'qualified_type'
]);

const fileExtensions = ['go'];
const parser = TreeSitterGo;

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
