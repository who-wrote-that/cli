export type Span = {
  from: number;
  to: number;
}

export type Declaration = {
  name: string;
  type: string;
  from: number;
  to: number;
}

export type Author = {
  name: string;
  email: string;
}

export type Owner = {
  author: Author;
  score: number;
}

export type CodeOwners = {
  declaration: Declaration;
  owners: Owner[];
}

export enum Format {
  PRETTY = 'pretty',
  DATA = 'data',
  JSON = 'json',
}

export enum Strategy {
  WEIGHTED_LINES = 'weighted-lines',
  LINES = 'lines',
}
