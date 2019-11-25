import { Language } from './types';
import Java from './Java';

const languages: Language[] = [Java];

export const getLanguage = (fileExtension: string): Language =>
    languages.find(lang => lang.fileExtensions.includes(fileExtension));
