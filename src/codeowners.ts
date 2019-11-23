import {getOwnerOfCommit, Owner, readFileAtCommit} from './git';
import {findDef, findSpans} from './parse';
import {readFile} from './util';

export const codeOwners = (filePath: string, line: number): Promise<Owner[]> => {
    const aux = (def: string, commitIndex: number): Promise<Owner[]> => {
        return readFileAtCommit(filePath, commitIndex)
            .then(sourceCodeAtCommit => {
                const spans = findSpans(sourceCodeAtCommit, def);
                return Promise.all(spans.map(span => getOwnerOfCommit(filePath, commitIndex, span)))
                    .then(mergeDuplicateOwners)
                    .then(owners => {
                        return aux(def, commitIndex+1).then(newOwners => {
                            return [...owners, ...newOwners]
                        })
                    }).catch(err => {
                        console.error(err);
                        return [];
                    })
            }).catch(err => {
                // console.log("HALLLLLO");
                // console.error(err);
                return [];
            })
    };

    return readFile(filePath).then(sourceCode => {
        return aux(findDef(sourceCode, line), 1);
    })
};

const mergeDuplicateOwners = (owners: Owner[]): Owner[] => {
    const tmp = new Map();
    owners.forEach(owner => {
        if (tmp.has(owner.author)) tmp.set(owner.author, tmp.get(owner.author) + owner.score);
        else tmp.set(owner.author, owner.score);
    });
    return Array.from(tmp.entries(), ([k, v]) => ({author: k, score: v}))
};