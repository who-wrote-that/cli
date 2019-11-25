// import {Declaration} from '../parse';
//
// const extractClassDeclarationName = (text: string): string => {
//     const indexFirstBrace = text.indexOf('{');
//     const elements = text.substring(0, indexFirstBrace).split(' ');
//     return elements.filter(element => element !== '').pop();
// };
//
// const extractClassDeclaration = (text: string): Declaration => ({
//     name: extractClassDeclarationName(text),
//     type: 'class_declaration',
// });
//
// const extractMethodDefinitionName = (text: string): string => {
//     const indexFirstBracket = text.indexOf('(');
//     const elements = text.substring(0, indexFirstBracket).split(' ');
//     return elements.filter(element => element !== '').pop();
// };
//
// const extractMethodDefinition = (text: string): Declaration => ({
//     name: extractMethodDefinitionName(text),
//     type: 'method_definition',
// });
//
// export const supportedDeclarations = new Map([
//     ['class_declaration', extractClassDeclaration],
//     ['method_definition', extractMethodDefinition],
// ]);
