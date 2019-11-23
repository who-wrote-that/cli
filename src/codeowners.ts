import {commitsAffectingFile, getOwnerOfCommit, Owner, readFileAtCommit} from './git';
import {findDef, findSpans} from './parse';
import {readFile} from './util';

export const codeOwners = (filePath: string, line: number, depth: number): Promise<Owner[]> => {
    const aux = (def: string, commitHashes: string[], commitIndex: number): Promise<Owner[]> => {
        if (depth && commitIndex >= depth || commitIndex >= commitHashes.length)
            return new Promise(resolve => resolve([]));

        return readFileAtCommit(filePath, commitHashes[commitIndex])
            .then(sourceCodeAtCommit => {
                const spans = findSpans(sourceCodeAtCommit, def);
                // if current commit does not contain def
                // assume no earlier commit contains def
                if (spans.length == 0) return [];
                return Promise.all(spans.map(span => getOwnerOfCommit(filePath, commitHashes[commitIndex], span)))
                    .then(mergeDuplicateOwners)
                    .then(owners => {
                        return aux(def, commitHashes,commitIndex+1).then(newOwners => {
                            return mergeDuplicateOwners([...owners, ...newOwners]);
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
            return aux(findDef(sourceCode, line), commitHashes, 0);
        }).then(owners => owners.sort((a, b) => a.score < b.score ? 1 : -1));
    });
};

const mergeDuplicateOwners = (owners: Owner[]): Owner[] => {
    const tmp = new Map();
    owners.filter(owner => owner.score > 0).forEach(owner => {
        if (tmp.has(owner.author)) tmp.set(owner.author, tmp.get(owner.author) + owner.score);
        else tmp.set(owner.author, owner.score);
    });
    return Array.from(tmp.entries(), ([k, v]) => ({author: k, score: v}));
};