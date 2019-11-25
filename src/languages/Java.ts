import Parser from 'tree-sitter'
import TreeSitterJava from 'tree-sitter-java'
import { Declaration } from '../types'

const fileExtensions = ['java']
const parser = TreeSitterJava

const findDeclaration = (node: Parser.SyntaxNode): Declaration => {
  switch (node.type) {
  case 'class_declaration':
  case 'method_declaration':
    return {
      type: node.type,
      name: node.nameNode.text,
      from: node.startPosition.row,
      to: node.endPosition.row
    }
  }
}

export default { fileExtensions, parser, findDeclaration }
