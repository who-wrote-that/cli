# Codeowners CLI

A command line tool to quickly find code owners of definitions (class/function/...), files, and directories.

### What you'll find in this document:

* [Inspiration](#inspiration)
* [Usage](#usage)
  * [Installation](#installation)
  * [`line`](#line)
  * [`def`](#def)
  * [Options](#options)
  * [Language support](#language-support)
* [Theory](#theory)
  * [Algorithm](#algorithm)
  * [Strategies](#strategies)
* [Extensibility](#extensibility)
  * [Adding a new language](#adding-a-new-language)
* [Development](#development)
* [Release](#release)

## Inspiration

Starting to work on a larger software project is often intimidating. We developed this powerful tool to make it easier for programmers to get familiar with a new project. Codeowners is aiming to attack this problem on multiple levels:

1. It makes it easy to find a person of contact that owns a specific definition within a file. Depending on the programming language a definition may be a function or method definition, a class declaration or an interface. A substantial algorithm is used to provide accurate results that take into account the entire history of a project.
2. It provides a structured overview of a file/project that also includes information on code ownership.

Codeowners works with Git repositories. It uses [Tree-sitter](http://tree-sitter.github.io/tree-sitter/) parsers to build Abstract Syntax Trees of code written in a multitude of different programming languages. [Programming languages supported by Codeowners](#language-support) include:

* Java
* JavaScript
* Python
* Go

One of the core design-principles is to keep the effort required to [add support for a new programming language](#adding-a-new-language) to a bare minimum.

## Usage

To use Codeowners with your directory or file, it must be or be located within a Git repository and it must use one of the [supported programming languages](#language-support).

### Installation

You can install Codeowners globally with Yarn

    $ yarn global add codeowners

or NPM

    $ npm install -g codeowners

### `line`

```
codeowners line <file> <lineNumber>
```

Lookup code owners for a specific line of a file.

### `def`

```
codeowners def <file> <definition>
```

Lookup code owners given a definition inside a file.

### Options

| Option | Description |
| ------ | ----------- |
| `-d --depth <number>` | The maxmium recursive depth of the [code owner algorithm](#algorithm) (e.g. the number of commits to look back in history). Takes a positive number. Defaults to `undefined` -- unlimited recursive depth. |
| `-f --format <format>` | Output format. Allowed values are `pretty`, `data`, and `json`. Defaults to `pretty`. |
| `-s --strategy` | [Strategy](#strategies) used for the [code owner algorithm](#algorithm). Allowed values are `weighted-lines`, and `lines`. Defaults to `weighted-lines`. |
| `-v --version` | Outputs the version number |
| `-h --help` | Outputs usage information |

### Language support

* Java
* JavaScript
* Python
* Go

## Theory

### Algorithm

### Strategies

## Extensibility

### Adding a new language

To add support for a new language

* create a language file in `src/languages`;
* and add the language to `supportedLanguages` in `src/parse.ts`.

## Development

Listen to changes and make them accessible through `codeowners` from the command line:

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
