import {Declaration} from '../parse';

const extractClassDefinitionName = (text: string): string => {
    return text.replace('class ', '').split(':')[0];
};

const extractClassDefinition = (text: string): Declaration => ({
    name: extractClassDefinitionName(text),
    type: 'class_definition',
});

const extractFunctionDefinitionName = (text: string): string => {
    return text.replace('def ', '').split('(')[0];
};

const extractFunctionDefinition = (text: string): Declaration => ({
    name: extractFunctionDefinitionName(text),
    type: 'function_definition',
});

export const supportedDeclarations = new Map([
    ['class_definition', extractClassDefinition],
    ['function_definition', extractFunctionDefinition],
]);
