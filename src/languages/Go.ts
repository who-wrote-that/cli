import Parser from 'tree-sitter';
import TreeSitterGo from 'tree-sitter-go';
import { Declaration } from '../types';

const extractTypeDeclarationName = (node: Parser.SyntaxNode): string => {
    /*
    type a b.c

    ---
    (type_spec
      name: (type_identifier)
      type: (qualified_type
        package: (package_identifier)
        name: (type_identifier)))
    */
    return node.children[1].children[0].text;
};

const extractFunctionDeclarationName = (node: Parser.SyntaxNode): string => {
    /*
    (function_declaration
    (identifier)
    (parameter_list)
    (block))
    */
    return node.children[1].text;
};

const extractMethodDeclarationName = (node: Parser.SyntaxNode): string => {
    /*
    (method_declaration
    (parameter_list
      (parameter_declaration (identifier) (type_identifier)))
    (field_identifier)
    (parameter_list
      (parameter_declaration (identifier) (type_identifier)))
    (type_identifier)
    (block))
    */
    return node.children[2].text;
};

const fileExtensions = ['go'];
const parser = TreeSitterGo;

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
    const declaration: Declaration = {
        type: node.type,
        name: null,
        from: node.startPosition.row,
        to: node.endPosition.row
    };

    switch (node.type) {
    case 'type_declaration':
        declaration.name = extractTypeDeclarationName(node);
        return declaration;
    case 'function_declaration':
        declaration.name = extractFunctionDeclarationName(node);
        return declaration;
    case 'method_declaration':
        declaration.name = extractMethodDeclarationName(node);
        return declaration;
    }
};

export default { fileExtensions, parser, findDeclaration };
