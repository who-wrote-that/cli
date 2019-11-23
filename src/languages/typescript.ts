import {Declaration} from '../parse';

const extractClassDeclarationName = (text: string): string => {
    const indexFirstBrace = text.indexOf('{');
    const elements = text.substring(0, indexFirstBrace).split(' ');
    return elements.filter(element => element !== '').pop();
};

const extractClassDeclaration = (text: string): Declaration => ({
    name: extractClassDeclarationName(text),
    type: 'class_declaration',
});

const extractFunctionDeclarationName = (text: string): string => {
    const indexFirstBracket = text.indexOf('(');
    const elements = text.substring(0, indexFirstBracket).split(' ');
    return elements.filter(element => element !== '').pop();
};

const extractFunctionDeclaration = (text: string): Declaration => ({
    name: extractFunctionDeclarationName(text),
    type: 'function_declaration',
});

export const supportedDeclarations = new Map([
    ['class_declaration', extractClassDeclaration],
    ['function_definition', extractFunctionDeclaration],
]);
