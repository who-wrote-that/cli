import { CodeOwners, Declaration, Format, Owner, Strategy } from './types';
import { readFile, round } from './util';
import { commitsAffectingFile, getOwnerOfCommit, readFileAtCommit } from './git';
import { getLanguage } from './languages'
import Parser from './Parser';

export default class WhoWroteThat {
    filePath: string;
    depth: number;
    strategy: Strategy;
    format: Format;
    parser: Parser;

    constructor(filePath: string, depth: number, strategy: Strategy, format: Format) {
        this.filePath = filePath;
        this.depth = depth;
        this.strategy = strategy;
        this.format = format;

        const fileExtension = this.filePath.split('.').pop();
        const lang = getLanguage(fileExtension);
        if (lang)
            this.parser = new Parser(lang);
        else
            this.fail(`No language support for .${fileExtension} files`);
    }

    fail(error: string): void {
        if (this.format === Format.JSON)
            console.error(JSON.stringify({ error }));
        else
            console.error(error);

        process.exit(1);
    };

    decl(name: string): Promise<CodeOwners> {
        return commitsAffectingFile(this.filePath).then(commits => {
            return readFile(this.filePath).then(sourceCode => {
                const rootNode = this.parser.parse(sourceCode);
                const declaration = this.parser.findDeclarationByName(rootNode, name);
                return codeOwnersRec(this.filePath, this.depth, this.strategy, this.parser, declaration, commits, 0).then(owners => ({ declaration, owners }));
            }).then(transformResult);
        });
    }

    line(line: number): Promise<CodeOwners> {
        return commitsAffectingFile(this.filePath).then(commits => {
            return readFile(this.filePath).then(sourceCode => {
                const rootNode = this.parser.parse(sourceCode);
                const declaration = this.parser.findDeclarationByLine(rootNode, line);
                return codeOwnersRec(this.filePath, this.depth, this.strategy, this.parser, declaration, commits, 0).then(owners => ({ declaration, owners }));
            }).then(transformResult);
        });
    }
}

const codeOwnersRec = (filePath: string, depth: number, strategy: string, parser: Parser, declaration: Declaration, commits: string[], commitIndex: number): Promise<Owner[]> => {
    if (depth && commitIndex >= depth || commitIndex >= commits.length)
        return new Promise(resolve => resolve([]));

    return readFileAtCommit(filePath, commits[commitIndex])
        .then(sourceCodeAtCommit => {
            const node = parser.parse(sourceCodeAtCommit);
            const spans = parser.findSpans(node, declaration);

            // if current commit does not contain declaration
            // assume no earlier commit contains declaration
            if (spans.length == 0) return [];

            return Promise.all(spans.map(span => getOwnerOfCommit(filePath, commits[commitIndex], span)))
                .then(mergeDuplicateOwners)
                .then(owners => {
                    return codeOwnersRec(filePath, depth, strategy, parser, declaration, commits, commitIndex + 1).then(newOwners => {
                        return mergeDuplicateOwners([...owners, ...scale(strategy, newOwners, weight(strategy, owners))]);
                    });
                }).catch(err => {
                    console.error(err);
                    return [];
                });
        }).catch(() => {
            // file could not be read at HEAD~commitIndex
            return [];
        });
};

const transformResult = (result: CodeOwners): CodeOwners => ({
    ...result,
    owners: squish(
        result.owners
            .sort((a, b) => a.score < b.score ? 1 : -1)
    ).filter(owner => owner.score > 0)
});

const scale = (strategy: string, owners: Owner[], weight: number): Owner[] => {
    if (strategy === Strategy.WEIGHTED_LINES)
        return owners.map(owner => ({...owner, score: owner.score * (weight - weight / 4) / weight}));
    else if (strategy === Strategy.LINES)
        return owners;
};

const weight = (strategy: string, owners: Owner[]): number => {
    if (strategy === Strategy.WEIGHTED_LINES)
        return owners.map(owner => owner.score).reduce((sum, score) => sum + score) + 1;
    else if (strategy === Strategy.LINES)
        return null;
};

const squish = (owners: Owner[]): Owner[] => {
    const maxScore = Math.max(...owners.map(owner => owner.score));

    return owners.map(owner => ({...owner, score: round(0, 100 * owner.score / maxScore)}));
};

const mergeDuplicateOwners = (owners: Owner[]): Owner[] => {
    const emails = new Set(owners.map(owner => owner.author.email));

    return Array.from(emails, email => {
        const sameOwners = owners.filter(owner => owner.author.email === email);
        return {
            author: sameOwners[0].author,
            score: sameOwners.map(owner => owner.score).reduce((ovr, score) => ovr + score)
        };
    });
};
