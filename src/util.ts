import fs from 'fs';

export const readFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            !err ? resolve(data) : reject(err);
        });
    });
};

export const round = (decimalPlaces: number, value: number): number => {
    return Math.round(10**decimalPlaces * value) / 10**decimalPlaces;
};
