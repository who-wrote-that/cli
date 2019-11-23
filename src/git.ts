import childProcess from 'child_process'
import {Span} from './parse';

export type Owner = {
    author: string;
    score: number;
}

const getChangedLineNumbersAtCommit = (filePath: string, commitIndex: number): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git diff -U0 HEAD~${commitIndex+1} HEAD~${commitIndex} ./${filePath}`,
            (err, data) => {
                if (!err) {
                    childProcess.exec(`git diff -U0 HEAD~${commitIndex+1} HEAD~${commitIndex} ./${filePath} | diff-lines`,
                        (err, data) => {
                            !err ? resolve(data.split('\n').map(n => parseInt(n)).filter(n => !isNaN(n))): reject(err)
                        })
                } else {
                    childProcess.exec(
                        `git show HEAD~${commitIndex} ./${filePath} | diff-lines`,
                        (err, data) => {
                            !err ? resolve(data.split('\n').map(n => parseInt(n)).filter(n => !isNaN(n))): reject(err)
                        })
                }
            }
        )
    })
};

const getAuthorOfCommit = (commitIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show HEAD~${commitIndex} | grep Author`,
            (err, data) => !err ? resolve(data.substring(data.indexOf(' ') + 1).trim()) : reject(err)
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
               score: lineNumbers.filter(n => n >= span.from && n <= span.to).length,
           }
        }).catch(err => {
            console.error(err);
            process.exit(1);
        })
};
