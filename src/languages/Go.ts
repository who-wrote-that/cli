import TreeSitterGo from 'tree-sitter-go';
import {findDeclaration} from './util';

const NODE_TYPES = Object.freeze([
    'function_declaration',
    'method_declaration',
    'type_alias',
    'field_declaration',
    'qualified_type'
]);

const fileExtensions = ['go'];
const parser = TreeSitterGo;

export default {
    fileExtensions,
    parser,
    findDeclaration: findDeclaration(NODE_TYPES)
};
