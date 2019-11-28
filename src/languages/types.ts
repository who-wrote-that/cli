import Parser from 'tree-sitter';
import { Declaration } from '../types';

export type Language = {
  fileExtensions: string[];
  parser: any;
  findDeclaration: (node: Parser.SyntaxNode) => Declaration;
}
