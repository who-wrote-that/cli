import { CodeOwners, Declaration, Owner, Strategy } from './types';
import { readFile, round } from './util';
import Git from './Git';
import { getLanguage } from './languages';
import Parser from './Parser';

export default class WhoWroteThat {
    filePath: string;
    depth: number;
    strategy: Strategy;
    parser: Parser;

    constructor(
        filePath: string,
        depth: number,
        strategy: Strategy,
        fail: (error: string) => void
    ) {
        this.filePath = filePath;
        this.depth = depth;
        this.strategy = strategy;

        const fileExtension = this.filePath.split('.').pop();
        const lang = getLanguage(fileExtension);
        if (lang)
            this.parser = new Parser(lang);
        else
            fail(`No language support for .${fileExtension} files`);
    }

    decl(name: string): Promise<CodeOwners> {
        return Git.commitsAffectingFile(this.filePath).then(commits => {
            return readFile(this.filePath).then(sourceCode => {
                const rootNode = this.parser.parse(sourceCode);
                const declaration =
                    this.parser.findDeclarationByName(rootNode, name);
                return this.getDclarationOwners(declaration, commits, 0)
                    .then(owners => ({ declaration, owners }));
            }).then(transformResult);
        });
    }

    line(line: number): Promise<CodeOwners> {
        return Git.commitsAffectingFile(this.filePath).then(commits => {
            return readFile(this.filePath).then(sourceCode => {
                const rootNode = this.parser.parse(sourceCode);
                const declaration =
                    this.parser.findDeclarationByLine(rootNode, line);
                return this.getDclarationOwners(declaration, commits, 0)
                    .then(owners => ({ declaration, owners }));
            }).then(transformResult);
        });
    }

    private getDclarationOwners(
        decl: Declaration,
        commits: string[],
        commitIndex: number
    ): Promise<Owner[]> {
        if (
            this.depth && commitIndex >= this.depth ||
            commitIndex >= commits.length
        ) return new Promise(resolve => resolve([]));

        return Git.readFileAtCommit(this.filePath, commits[commitIndex])
            .then(sourceCodeAtCommit => {
                const node = this.parser.parse(sourceCodeAtCommit);
                const spans = this.parser.findSpans(node, decl);

                // if current commit does not contain declaration
                // assume no earlier commit contains declaration
                if (spans.length == 0) return [];

                return Promise.all(
                    spans.map(span => Git.getOwnerOfCommit(
                        this.filePath,
                        commits[commitIndex],
                        span
                    ))
                )
                    .then(mergeDuplicateOwners)
                    .then(owners => {
                        return this.getDclarationOwners(
                            decl,
                            commits,
                            commitIndex + 1
                        ).then(newOwners => mergeDuplicateOwners([
                            ...owners,
                            ...scale(
                                this.strategy,
                                newOwners,
                                weigh(this.strategy, owners)
                            )
                        ]));
                    });
            }).catch(() => {
                // file could not be read at HEAD~commitIndex
                return [];
            });
    }
}

const transformResult = (result: CodeOwners): CodeOwners => ({
    ...result,
    owners: result.owners.map(owner => ({
        ...owner,
        score: relativeScore(
            owner.score,
            result.declaration.span.to - result.declaration.span.from
        )
    }))
        .sort((a, b) => a.score < b.score ? 1 : -1)
        .filter(owner => owner.score > 0)
});

const scale = (
    strategy: Strategy,
    owners: Owner[],
    weight: number
): Owner[] => {
    if (strategy === Strategy.WEIGHTED_LINES)
        return owners.map(owner => ({
            ...owner,
            score: owner.score * (weight - weight / 4) / weight
        }));
    else if (strategy === Strategy.LINES)
        return owners;
};

const weigh = (strategy: Strategy, owners: Owner[]): number => {
    if (strategy === Strategy.WEIGHTED_LINES)
        return owners
            .map(owner => owner.score)
            .reduce((sum, score) => sum + score) + 1;
    else if (strategy === Strategy.LINES)
        return null;
};

const relativeScore = (score: number, lineCount: number): number =>
    round(0, 100 * score / lineCount);

const mergeDuplicateOwners = (owners: Owner[]): Owner[] => {
    const emails = new Set(owners.map(owner => owner.author.email));

    return Array.from(emails, email => {
        const sameOwners = owners.filter(owner => owner.author.email === email);
        return {
            author: sameOwners[0].author,
            score: sameOwners
                .map(owner => owner.score)
                .reduce((ovr, score) => ovr + score)
        };
    });
};
