import { createToken, Lexer } from "chevrotain";

export const Newline = createToken({
  name: "Newline",
  pattern: /\r?\n/,
});

export const Export = createToken({
  name: "Export",
  pattern: /export\b/,
});

export const Comment = createToken({
  name: "Comment",
  pattern: /#[^\r\n]*/,
});

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[A-Za-z_][A-Za-z0-9_.-]*/,
});

export const Assign = createToken({
  name: "Assign",
  pattern: /=/,
});

export const Spaces = createToken({
  name: "Spaces",
  pattern: /[ \t]+/,
});

export const Value = createToken({
  name: "Value",
  pattern: /[^\r\n]+/,
});

export const Unknown = createToken({
  name: "Unknown",
  pattern: /[^]/,
});

export const allTokens = [
  Newline,
  Export,
  Comment,
  Identifier,
  Spaces,
  Assign,
  Value,
  Unknown,
];

export const EnvLexer = new Lexer(allTokens);
