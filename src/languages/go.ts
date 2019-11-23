import {Declaration} from '../parse';

const extractTypeDeclarationName = (text: string): string => {
    return text.replace('type ', '').split(' ')[0];
};

const extractTypeDeclaration = (text: string): Declaration => ({
    name: extractTypeDeclarationName(text),
    type: 'type_declaration',
});

const extractFunctionDeclarationName = (text: string): string => {
    return text.replace('func ', '').split(' ')[0];
};

const extractFunctionDeclaration = (text: string): Declaration => ({
    name: extractFunctionDeclarationName(text),
    type: 'function_declaration',
});

export const supportedDeclarations = new Map([
    ['type_declaration', extractTypeDeclaration],
    ['function_declaration', extractFunctionDeclaration],
]);
