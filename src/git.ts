import childProcess from 'child_process';
import { Author, Owner, Span } from './types';

const MEGABYTE = 1024000;

const execOptions = {
    maxBuffer: 3 * MEGABYTE,
};

const getChangedLineNumbersAtCommit = (
    filePath: string,
    commitHash: string
): Promise<number[]> => new Promise((resolve, reject) => {
    childProcess.exec(
        `git diff -U0 ${commitHash}~ ${commitHash} ./${filePath}`,
        execOptions,
        err => {
            if (!err) {
                getDiff(
                    `git diff -U0 ${commitHash}~ ${commitHash} ./${filePath} ` +
                    '| diff-lines'
                )
                    .then(resolve)
                    .catch(reject);
            } else {
                getDiff(`git show ${commitHash} ./${filePath} | diff-lines`)
                    .then(resolve)
                    .catch(reject);
            }
        }
    );
});

const getDiff = (command: string): Promise<number[]> =>
    new Promise((resolve, reject) => {
        childProcess.exec(
            command,
            execOptions,
            (err, data) => {
                if (!err)
                    resolve(
                        data.split('\n')
                            .map(n => parseInt(n)).filter(n => !isNaN(n))
                    );
                else
                    reject(err);
            }
        );
    });

const getAuthorOfCommit = (commitHash: string): Promise<Author> =>
    new Promise((resolve, reject) => {
        childProcess.exec(
            `git show ${commitHash} | grep Author`,
            execOptions,
            (err, data) => {
                if (!err) {
                    const line = data.split('\n')[0];
                    const name = line.substring(
                        line.indexOf(' ') + 1,
                        line.lastIndexOf('<') - 1
                    );
                    const email = line.substring(
                        line.lastIndexOf('<') + 1,
                        line.lastIndexOf('>')
                    );
                    resolve({ name, email });
                } else reject(err);
            }
        );
    });

export const commitsAffectingFile = (filePath: string): Promise<string[]> =>
    new Promise((resolve, reject) => {
        childProcess.exec(
            `git log --follow ./${filePath} | grep commit`,
            execOptions,
            (err, data) => {
                if (!err)
                    resolve(
                        data.split('\n')
                            .map(line => line.replace('commit ', ''))
                    );
                else
                    reject(err);
            }
        );
    });

export const readFileAtCommit = (
    filePath: string,
    commitHash: string
): Promise<string> => new Promise((resolve, reject) => {
    childProcess.exec(
        `git show ${commitHash}:./${filePath}`,
        execOptions,
        (err, data) => !err ? resolve(data) : reject(err)
    )
})

export const getOwnerOfCommit = (
    filePath: string,
    commitHash: string,
    span: Span
): Promise<Owner> => Promise.all([
    getAuthorOfCommit(commitHash),
    getChangedLineNumbersAtCommit(filePath, commitHash)
]).then(([author, lineNumbers]) => ({
    author,
    score: lineNumbers.filter(n => n >= span.from && n <= span.to).length,
}));
