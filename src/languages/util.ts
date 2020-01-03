import Parser from 'tree-sitter';
import { Declaration } from '../types';

export const findDeclaration = (nodeTypes: readonly string[]) =>
    (node: Parser.SyntaxNode): Declaration => {
        if (nodeTypes.includes(node.type))
            return {
                type: node.type,
                // @ts-ignore
                name: node.nameNode.text,
                span: {
                    from: node.startPosition.row,
                    to: node.endPosition.row
                }
            };
    };
