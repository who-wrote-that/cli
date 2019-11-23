import {Declaration} from '../parse';

const extractDeclarationName = (text: string): string => {
    text = text.split('\n').filter(line => !line.trim().startsWith('@')).join('\n');
    const indexFirstBracket = text.indexOf('(');
    const elements = text.substring(0, indexFirstBracket).split(' ');
    return elements.pop();
};

const extractClassDeclaration = (text: string): Declaration => ({
    name: extractDeclarationName(text),
    type: 'class_declaration',
});

const extractMethodDeclaration = (text: string): Declaration => ({
    name: extractDeclarationName(text),
    type: 'method_declaration',
});

export const supportedDeclarations = new Map([
    ['class_declaration', extractClassDeclaration],
    ['method_declaration', extractMethodDeclaration],
]);
