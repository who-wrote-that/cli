import childProcess from 'child_process'
import {Span} from './parse';

type Author = {
    name: string;
    email: string;
}
export type Owner = {
    author: Author;
    score: number;
}

const getChangedLineNumbersAtCommit = (filePath: string, commitHash: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git diff -U0 ${commitHash}~ ${commitHash} ./${filePath}`,
            (err, data) => {
                if (!err) {
                    getDiff(`git diff -U0 ${commitHash}~ ${commitHash} ./${filePath} | diff-lines`)
                        .then(lineNumbers => resolve(lineNumbers))
                        .catch(err => {
                            console.error(err);
                            process.exit(1);
                        })
                } else {
                    getDiff(`git show ${commitHash} ./${filePath} | diff-lines`)
                        .then(lineNumbers => resolve(lineNumbers))
                        .catch(err => {
                            console.error(err);
                            process.exit(1);
                        })
                }
            }
        )
    })
};

const getDiff = (command: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
            childProcess.exec(command,
                (err, data) => {
                    !err ? resolve(data.split('\n').map(n => parseInt(n)).filter(n => !isNaN(n))) : reject(err)
                })
        }
    )
};

const getAuthorOfCommit = (commitHash: string): Promise<Author> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show ${commitHash} | grep Author`,
            (err, data) => {
                if (!err) {
                    const line = data.split('\n')[0];
                    resolve({
                        name: line.substring(line.indexOf(' ') + 1, line.lastIndexOf('<') - 1),
                        email: line.substring(line.lastIndexOf('<') + 1, line.lastIndexOf('>')),
                    })
                } else {
                    reject(err)
                }
            }
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
