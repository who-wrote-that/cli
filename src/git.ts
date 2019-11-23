import childProcess from 'child_process'
import {Span} from './parse';

export type Owner = {
    author: string;
    score: number;
}

const getChangedLineNumbersAtCommit = (filePath: string, commitHash: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git diff -U0 ${commitHash}~ ${commitHash} ./${filePath}`,
            (err, data) => {
                if (!err) {
                    childProcess.exec(`git diff -U0 ${commitHash}~ ${commitHash} ./${filePath} | diff-lines`,
                        (err, data) => {
                            !err ? resolve(data.split('\n').map(n => parseInt(n)).filter(n => !isNaN(n))): reject(err)
                        })
                } else {
                    childProcess.exec(
                        `git show ${commitHash} ./${filePath} | diff-lines`,
                        (err, data) => {
                            !err ? resolve(data.split('\n').map(n => parseInt(n)).filter(n => !isNaN(n))): reject(err)
                        })
                }
            }
        )
    })
};

const getAuthorOfCommit = (commitHash: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show ${commitHash} | grep Author`,
            (err, data) => !err ? resolve(data.substring(data.indexOf(' ') + 1).split('\n')[0]) : reject(err)
        )
    })
};

export const commitsAffectingFile = (filePath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git log --follow ./${filePath} | grep commit`,
            (err, data) => !err ? resolve(data.split('\n').map(line => line.replace('commit ', ''))) : reject(err)
        )
    })
};

export const readFileAtCommit = (filePath: string, commitHash: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show ${commitHash}:./${filePath}`,
            (err, data) => !err ? resolve(data) : reject(err)
        )
    })
};

export const getOwnerOfCommit = (filePath: string, commitHash: string, span: Span): Promise<Owner> => {
    return Promise.all([getAuthorOfCommit(commitHash), getChangedLineNumbersAtCommit(filePath, commitHash)])
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
