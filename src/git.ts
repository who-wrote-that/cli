import childProcess from 'child_process'
import {Span} from './parse';

export type Owner = {
    author: string;
    score: number;
}

const getChangedLineNumbersAtCommit = (filePath: string, commitIndex: number): Promise<Set<number>> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git diff -U0 HEAD~${commitIndex} HEAD~${commitIndex-1} ${filePath} | ./diff-lines`,
            (err, data) => !err
                ? resolve(new Set(data.split('\n').map(n => parseInt(n))))
                : reject(err)
        )
    })
};

const getAuthorOfCommit = (commitIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show HEAD~${commitIndex} | grep Author`,
            (err, data) => !err ? resolve(data.substring(data.indexOf(' ') + 1)) : reject(err)
        )
    })
};

export const readFileAtCommit = (filePath: string, commitIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show HEAD~${commitIndex}:./${filePath}`,
            (err, data) => !err ? resolve(data) : reject(err)
        )
    })
};

export const getOwnerOfCommit = (filePath: string, commitIndex: number, span: Span): Promise<Owner> => {
    return Promise.all([getAuthorOfCommit(commitIndex), getChangedLineNumbersAtCommit(filePath, commitIndex)])
        .then(([author, lineNumbers]) => {
           return {
               author,
               score: Array.from(lineNumbers.values()).filter(n => n >= span.from && n <= span.to).length,
           }
        })
};
