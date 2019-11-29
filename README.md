# Who Wrote That CLI

A command line tool to quickly lookup code owners of classes, methods and more.

### What you'll find in this document:

* [Inspiration](#inspiration)
* [Usage](#usage)
  * [Installation](#installation)
  * [`decl`](#decl)
  * [`line`](#line)
  * [Options](#options)
  * [Language support](#language-support)
* [Extensibility](#extensibility)
  * [Adding a new language](#adding-a-new-language)
* [Development](#development)
* [Release](#release)

## Inspiration

Starting to work on a larger software project is often intimidating. Who Wrote That makes it easy to find a person of contact that owns a specific declaration within a file. Depending on the programming language a declaration may be a function, method, class or interface declaration.

Who Wrote That works with Git repositories. It uses [Tree-sitter](http://tree-sitter.github.io/tree-sitter/) parsers to build Abstract Syntax Trees of code written in a [multitude of different programming languages](#language-support).

## Usage

To use Who Wrote That with your directory or file, it must be or be located within a Git repository and it must use one of the [supported programming languages](#language-support).

### Installation

You can install Who Wrote That globally with Yarn

    $ yarn global add who-wrote-that

or NPM

    $ npm install -g who-wrote-that

### `decl`

```
wwt decl <file> <definition>
```

Lookup code owners of a given declaration inside a file.

### `line`

```
wwt line <file> <lineNumber>
```

Lookup code owners of a declaration on a given line of a file.

### Options

| Option | Description |
| ------ | ----------- |
| `-d --depth <number>` | The maxmium recursive depth of the [code owner algorithm](#algorithm) (e.g. the number of commits to look back in history). Takes a positive number. Defaults to `undefined` -- unlimited recursive depth. |
| `-f --format <format>` | Output format. Allowed values are `pretty`, `data`, and `json`. Defaults to `pretty`. |
| `-s --strategy <strategy>` | [Strategy](#strategies) used for the [code owner algorithm](#algorithm). Allowed values are `weighted-lines`, and `lines`. Defaults to `weighted-lines`. |
| `-v --version` | Outputs the version number |
| `-h --help` | Outputs usage information |

### Language support

* Go
* Java
* JavaScript
* Python

## Extensibility

### Adding a new language

To add support for a new language

* create a language file in `src/languages`;
* and import the language file in `src/languages/index.ts`.

## Development

Listen to changes and make them accessible through `wwt` from the command line:

    $ yarn start

Run ESLint:

    $ yarn eslint

Run TypeScript compiler checks:

    $ yarn tsc

Run tests:

    $ yarn test

## Release

1. Change the version in `package.json` and `src/index.ts`.
1. Create a pull request to merge the changes into `master`.
1. After the pull request was merged, create a new release listing the breaking changes and commits on `master` since the last release.
1. The release workflow will publish the package to NPM.
