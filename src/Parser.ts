import TreeSitter from 'tree-sitter'
import { Declaration, Span } from './types'
import { Language } from './languages/types'

export default class Parser {
  lang: Language
  parser: TreeSitter = new TreeSitter()

  constructor(lang: Language) {
    this.lang = lang

    this.parser.setLanguage(lang.parser)
  }

  parse = (sourceCode: string): TreeSitter.SyntaxNode =>
    this.parser.parse(sourceCode).rootNode

  findDeclarationByName = (
    node: TreeSitter.SyntaxNode, name: string
  ): Declaration => {
    const decl = this.lang.findDeclaration(node)
    if (decl && decl.name === name) return decl

    node.namedChildren.forEach(child => {
      const declAtChild = this.findDeclarationByName(child, name)
      if (declAtChild) return declAtChild
    })

    return null
  }

  findDeclarationByLine = (
    node: TreeSitter.SyntaxNode,
    line: number
  ): Declaration => {
    return node.namedChildren
      .map(child => {
        if (node.startPosition.row <= line && node.endPosition.row >= line)
          return this.findDeclarationByLine(child, line)
      })
      .filter(decl => decl !== null)
      .shift() || this.lang.findDeclaration(node)
  }

  findSpans = (node: TreeSitter.SyntaxNode, decl: Declaration): Span[] => {
    const nestedSpans =
      node.namedChildren.map(child => this.findSpans(child, decl)).flat()
    const declAtNode = this.lang.findDeclaration(node)

    if (declAtNode.name === decl.name && declAtNode.type === decl.type)
      return [{
        from: node.startPosition.row,
        to: node.endPosition.row
      }, ...nestedSpans]
    else
      return nestedSpans
  }
}
