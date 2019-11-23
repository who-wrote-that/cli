import childProcess from 'child_process'

export const readFileAtCommit = (filePath: string, commitIndex: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            `git show HEAD~${commitIndex}:${filePath}`,
            (err, data) => !err ? resolve(data) : reject(err)
        )
    })
};