import fs from 'fs';

export const readFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            !err ? resolve(data) : reject(err);
        });
    });
};