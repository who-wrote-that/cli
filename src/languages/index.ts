import { Language } from './types';
import Go from './Go';
import Java from './Java';
import JavaScript from './JavaScript';
import Python from './Python';
import Typescript from './TypeScript';
import TSX from './TSX';

const languages: Language[] = [Go, Java, JavaScript, Python, Typescript, TSX];

export const getLanguage = (fileExtension: string): Language =>
    languages.find(lang => lang.fileExtensions.includes(fileExtension));
