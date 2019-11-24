import {Declaration} from '../parse';

const extractClassDeclarationName = (text: string): string => {
    const indexClassToken = text.indexOf('class');
    const elements = text.substring(indexClassToken + 6).split(' ');
    return elements.filter(element => element !== '').shift();
};

const extractClassDeclaration = (text: string): Declaration => ({
    name: extractClassDeclarationName(text),
    type: 'class_declaration',
});

const extractMethodDeclarationName = (text: string): string => {
    text = text.split('\n').filter(line => !line.trim().startsWith('@')).join('\n');
    const indexFirstBracket = text.indexOf('(');
    const elements = text.substring(0, indexFirstBracket).split(' ');
    return elements.filter(element => element !== '').pop();
};

const extractMethodDeclaration = (text: string): Declaration => ({
    name: extractMethodDeclarationName(text),
    type: 'method_declaration',
});

export const supportedDeclarations = new Map([
    ['class_declaration', extractClassDeclaration],
    ['method_declaration', extractMethodDeclaration],
]);
