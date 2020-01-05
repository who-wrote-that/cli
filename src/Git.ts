import childProcess from 'child_process';
import {Author, Owner, Span} from './types';

const MEGABYTE = 1024000;

const EXEC_OPTIONS = Object.freeze({
    maxBuffer: 3 * MEGABYTE,
});

export default class Git {
    private static getChangedLineNumbersAtCommit(
        filePath: string,
        commitHash: string
    ): Promise<number[]> {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                `git diff -U0 ${commitHash}~ ${commitHash} ./${filePath}`,
                EXEC_OPTIONS,
                err => {
                    if (!err) {
                        this.getDiff(
                            `git diff -U0 ${commitHash}~ ${commitHash} ` +
                            ` ./${filePath} | diff-lines`
                        )
                            .then(resolve)
                            .catch(reject);
                    } else {
                        this.getDiff(
                            `git show ${commitHash} ./${filePath} | diff-lines`
                        )
                            .then(resolve)
                            .catch(reject);
                    }
                }
            );
        });
    }

    private static getDiff(command: string): Promise<number[]> {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                command,
                EXEC_OPTIONS,
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
    }

    private static getAuthorOfCommit(commitHash: string): Promise<Author> {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                `git show ${commitHash} | grep Author`,
                EXEC_OPTIONS,
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
                        resolve({name, email});
                    } else reject(err);
                }
            );
        });
    }

    static commitsAffectingFile(filePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // --pretty=format:"%H"
            // only show commit hashes
            // https://git-scm.com/docs/pretty-formats
            childProcess.exec(
                `git log --follow --pretty=format:"%H" ./${filePath}`,
                EXEC_OPTIONS,
                (err, data) => {
                    if (!err) resolve(data.split('\n'));
                    else reject(err);
                }
            );
        });
    }

    static readFileAtCommit(
        filePath: string,
        commitHash: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                `git show ${commitHash}:./${filePath}`,
                EXEC_OPTIONS,
                (err, data) => !err ? resolve(data) : reject(err)
            );
        });
    }

    static getOwnerOfCommit(
        filePath: string,
        commitHash: string,
        span: Span
    ): Promise<Owner> {
        return Promise.all([
            this.getAuthorOfCommit(commitHash),
            this.getChangedLineNumbersAtCommit(filePath, commitHash)
        ]).then(([author, lineNumbers]) => ({
            author,
            score: lineNumbers
                .filter(n => n >= span.from && n <= span.to).length,
        }));
    }
}
