import {commitsAffectingFile, getOwnerOfCommit, Owner, readFileAtCommit} from './git';
import {Declaration, findDeclaration, findSpans} from './parse';
import {readFile, round} from './util';

export const codeOwners = (filePath: string, line: number, depth: number, strategy: string): Promise<{def: Declaration; owners: Owner[]}> => {
    const aux = (def: Declaration, commitHashes: string[], commitIndex: number): Promise<Owner[]> => {
        if (depth && commitIndex >= depth || commitIndex >= commitHashes.length)
            return new Promise(resolve => resolve([]));

        return readFileAtCommit(filePath, commitHashes[commitIndex])
            .then(sourceCodeAtCommit => {
                const suffix = filePath.split('.').pop();
                const spans = findSpans(suffix, sourceCodeAtCommit, def);

                // if current commit does not contain def
                // assume no earlier commit contains def
                if (spans.length == 0) return [];

                return Promise.all(spans.map(span => getOwnerOfCommit(filePath, commitHashes[commitIndex], span)))
                    .then(mergeDuplicateOwners)
                    .then(owners => {
                        return aux(def, commitHashes,commitIndex + 1).then(newOwners => {
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

    return commitsAffectingFile(filePath).then(commitHashes => {
        return readFile(filePath).then(sourceCode => {
            const suffix = filePath.split('.').pop();
            const def = findDeclaration(suffix, sourceCode, line);
            return aux(def, commitHashes, 0).then(owners => ({def, owners}));
        }).then(result => ({
            ...result,
            owners: squish(
                result.owners
                    .sort((a, b) => a.score < b.score ? 1 : -1)
            ).filter(owner => owner.score > 0)
        }));
    });
};

const scale = (strategy: string, owners: Owner[], factor: number): Owner[] => {
    if (strategy === 'weighted-lines')
        return owners.map(owner => ({...owner, score: owner.score * (factor - factor / 4) / factor}));
    else if (strategy === 'lines')
        return owners;
};

const weight = (strategy: string, owners: Owner[]): number => {
    if (strategy === 'weighted-lines')
        return owners.map(owner => owner.score).reduce((sum, score) => sum + score) + 1;
    else if (strategy === 'lines')
        return null;
};

const squish = (owners: Owner[]): Owner[] => {
    const maxScore = Math.max(...owners.map(owner => owner.score));

    return owners.map(owner => ({...owner, score: round(0, 100 * owner.score / maxScore)}));
    // return owners;
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
