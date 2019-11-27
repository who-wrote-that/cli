import { Language } from './types';
import Go from './Go';
import Java from './Java';
import JavaScript from './JavaScript';
import Python from './Python';

const languages: Language[] = [Go, Java, JavaScript, Python];

export const getLanguage = (fileExtension: string): Language =>
    languages.find(lang => lang.fileExtensions.includes(fileExtension));
