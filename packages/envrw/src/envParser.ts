import { CstParser, IToken, tokenMatcher } from "chevrotain";
import {
  EnvLexer,
  allTokens,
  Comment,
  Value,
  Spaces,
  Assign,
  Identifier,
  Export,
  Newline,
  Unknown,
} from "./tokens";

const parserInstance = new (class EnvFileParser extends CstParser {
  public file = this.RULE("file", () => {
    this.MANY(() => {
      this.SUBRULE(this.line);
    });
  });

  public line = this.RULE("line", () => {
    this.MANY(() => {
      this.CONSUME(Spaces);
    });
    this.OPTION(() => {
      this.SUBRULE(this.entry);
    });
    this.MANY2(() => {
      this.CONSUME2(Spaces);
    });
    this.OPTION2(() => {
      this.CONSUME(Newline);
    });
  });

  private entry = this.RULE("entry", () => {
    this.OR([
      {
        GATE: () => this.hasAssignmentAhead(),
        ALT: () => this.SUBRULE(this.assignment),
      },
      { ALT: () => this.CONSUME(Comment) },
      { ALT: () => this.SUBRULE(this.unknown) },
    ]);
  });

  private assignment = this.RULE("assignment", () => {
    this.OPTION(() => {
      this.CONSUME(Export);
    });
    this.MANY(() => {
      this.CONSUME(Spaces);
    });
    this.CONSUME(Identifier);
    this.MANY2(() => {
      this.CONSUME2(Spaces);
    });
    this.CONSUME(Assign);
    this.MANY3(() => {
      this.CONSUME3(Spaces);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.valueSegments);
    });
  });

  private unknown = this.RULE("unknown", () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.CONSUME(Identifier) },
        { ALT: () => this.CONSUME(Value) },
        { ALT: () => this.CONSUME(Export) },
        { ALT: () => this.CONSUME(Assign) },
        { ALT: () => this.CONSUME(Spaces) },
        { ALT: () => this.CONSUME(Unknown) },
      ]);
    });
  });

  private valueSegments = this.RULE("valueSegments", () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.CONSUME(Value) },
        { ALT: () => this.CONSUME(Identifier) },
        { ALT: () => this.CONSUME(Export) },
        { ALT: () => this.CONSUME(Assign) },
        { ALT: () => this.CONSUME(Unknown) },
        { ALT: () => this.CONSUME(Comment) },
      ]);
    });
  });

  constructor() {
  super(allTokens);
    this.performSelfAnalysis();
  }

  private hasAssignmentAhead(): boolean {
    let offset = 1;
    let next = this.LA(offset);

    // Skip optional export keyword
    if (tokenMatcher(next, Export)) {
      offset += 1;
      next = this.LA(offset);
    }

    // Skip internal spaces before identifier
    while (tokenMatcher(next, Spaces)) {
      offset += 1;
      next = this.LA(offset);
    }

    if (!tokenMatcher(next, Identifier)) {
      return false;
    }

    offset += 1;
    next = this.LA(offset);

    while (tokenMatcher(next, Spaces)) {
      offset += 1;
      next = this.LA(offset);
    }

    return tokenMatcher(next, Assign);
  }
})();

const BaseVisitor = parserInstance.getBaseCstVisitorConstructor();

interface BaseLine {
  kind: "assignment" | "comment" | "blank" | "unknown";
  leadingSpaces: IToken[];
  trailingSpaces: IToken[];
  newlineToken: IToken | null;
  tokens: IToken[];
}

export interface AssignmentLine extends BaseLine {
  kind: "assignment";
  exportToken: IToken | null;
  preIdentifierSpaces: IToken[];
  identifier: IToken;
  preAssignSpaces: IToken[];
  assignToken: IToken;
  postAssignSpaces: IToken[];
  valueTokens: IToken[];
  key: string;
}

export interface CommentLine extends BaseLine {
  kind: "comment";
  commentToken: IToken;
}

export interface BlankLine extends BaseLine {
  kind: "blank";
}

export interface UnknownLine extends BaseLine {
  kind: "unknown";
}

export type EnvLine = AssignmentLine | CommentLine | BlankLine | UnknownLine;

const visitorInstance = new (class EnvVisitor extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  file(ctx: { line?: any[] }): EnvLine[] {
    return (ctx.line ?? []).map((lineNode) => this.visit(lineNode));
  }

  line(ctx: {
    Spaces?: IToken[];
    Spaces2?: IToken[];
    Newline?: IToken[];
    entry?: any[];
  }): EnvLine {
    const leadingSpaces = [...(ctx.Spaces ?? [])];
    const trailingSpaces = [...(ctx.Spaces2 ?? [])];
    const newlineToken = ctx.Newline?.[0] ?? null;

    if (!ctx.entry) {
      const tokens = [...leadingSpaces, ...trailingSpaces];
      return {
        kind: "blank",
        leadingSpaces,
        trailingSpaces,
        newlineToken,
        tokens,
      } satisfies BlankLine;
    }

    const entry = this.visit(ctx.entry[0]) as EnvLine;
    const tokens = [...leadingSpaces, ...entry.tokens, ...trailingSpaces];

    return {
      ...entry,
      leadingSpaces,
      trailingSpaces,
      newlineToken,
      tokens,
    } as EnvLine;
  }

  entry(ctx: { assignment?: any[]; Comment?: IToken[]; unknown?: any[] }): EnvLine {
    if (ctx.assignment) {
      return this.visit(ctx.assignment[0]);
    }
    if (ctx.Comment) {
      const commentToken = ctx.Comment?.[0];
      if (!commentToken) {
        throw new Error("Comment token missing in comment line");
      }
      return {
        kind: "comment",
        leadingSpaces: [],
        trailingSpaces: [],
        newlineToken: null,
        tokens: [commentToken],
        commentToken,
      } satisfies CommentLine;
    }
    return this.visit(ctx.unknown![0]);
  }

  assignment(ctx: {
    Export?: IToken[];
    Spaces?: IToken[];
    Identifier: IToken[];
    Spaces2?: IToken[];
    Assign: IToken[];
    Spaces3?: IToken[];
    Value?: IToken[];
    valueSegments?: any[];
  }): AssignmentLine {
    const exportToken = ctx.Export?.[0] ?? null;
    const preIdentifierSpaces = [...(ctx.Spaces ?? [])];
    const identifier = ctx.Identifier?.[0];
    if (!identifier) {
      throw new Error("Identifier token missing in assignment line");
    }
    const preAssignSpaces = [...(ctx.Spaces2 ?? [])];
    const assignToken = ctx.Assign?.[0];
    if (!assignToken) {
      throw new Error("Assign token missing in assignment line");
    }
    const postAssignSpaces = [...(ctx.Spaces3 ?? [])];
    const valueTokens = ctx.valueSegments
      ? (this.visit(ctx.valueSegments[0]) as IToken[])
      : ctx.Value
      ? [...ctx.Value]
      : [];
    const tokens: IToken[] = [];
    if (exportToken) {
      tokens.push(exportToken);
    }
    tokens.push(...preIdentifierSpaces, identifier, ...preAssignSpaces, assignToken);
    tokens.push(...postAssignSpaces);
    tokens.push(...valueTokens);

    return {
      kind: "assignment",
      leadingSpaces: [],
      trailingSpaces: [],
      newlineToken: null,
  tokens,
      exportToken,
      preIdentifierSpaces,
      identifier,
      preAssignSpaces,
      assignToken,
      postAssignSpaces,
      valueTokens,
      key: identifier.image,
    } satisfies AssignmentLine;
  }

  unknown(ctx: {
    Unknown?: IToken[];
    Identifier?: IToken[];
    Export?: IToken[];
    Assign?: IToken[];
    Value?: IToken[];
  }): UnknownLine {
    const tokens = [
      ...(ctx.Unknown ?? []),
      ...(ctx.Identifier ?? []),
      ...(ctx.Export ?? []),
      ...(ctx.Assign ?? []),
      ...(ctx.Value ?? []),
    ].sort((a, b) => a.startOffset - b.startOffset);

    return {
      kind: "unknown",
      leadingSpaces: [],
      trailingSpaces: [],
      newlineToken: null,
      tokens,
    } satisfies UnknownLine;
  }

  valueSegments(ctx: {
    Value?: IToken[];
    Identifier?: IToken[];
    Export?: IToken[];
    Assign?: IToken[];
    Unknown?: IToken[];
    Comment?: IToken[];
  }): IToken[] {
    return [
      ...(ctx.Value ?? []),
      ...(ctx.Identifier ?? []),
      ...(ctx.Export ?? []),
      ...(ctx.Assign ?? []),
      ...(ctx.Unknown ?? []),
      ...(ctx.Comment ?? []),
    ].sort((a, b) => tokenStart(a) - tokenStart(b));
  }
})();

export interface ParsedAssignment extends AssignmentLine {
  startOffset: number;
  endOffset: number;
  raw: string;
  valueStartOffset: number;
  valueEndOffset: number;
  valueText: string;
}

export interface ParsedComment extends CommentLine {
  startOffset: number;
  endOffset: number;
  raw: string;
}

export interface ParsedBlank extends BlankLine {
  startOffset: number;
  endOffset: number;
  raw: string;
}

export interface ParsedUnknown extends UnknownLine {
  startOffset: number;
  endOffset: number;
  raw: string;
}

export type ParsedLine =
  | ParsedAssignment
  | ParsedComment
  | ParsedBlank
  | ParsedUnknown;

export interface EnvDocument {
  content: string;
  lines: ParsedLine[];
  assignments: Map<string, ParsedAssignment>;
}

function tokenStart(token: IToken): number {
  if (typeof token.startOffset === "number") {
    return token.startOffset;
  }
  return 0;
}

function tokenEnd(token: IToken): number {
  if (typeof token.endOffset === "number") {
    return token.endOffset;
  }
  const start = tokenStart(token);
  return start + token.image.length - 1;
}

function enrichLineMetadata(line: EnvLine, content: string): ParsedLine {
  let start = Number.POSITIVE_INFINITY;
  let end = Number.NEGATIVE_INFINITY;

  for (const token of line.tokens) {
    const currentStart = tokenStart(token);
    if (currentStart < start) {
      start = currentStart;
    }
    const currentEnd = tokenEnd(token) + 1;
    if (currentEnd > end) {
      end = currentEnd;
    }
  }

  if (line.newlineToken) {
    const newlineStart = tokenStart(line.newlineToken);
    if (newlineStart < start) {
      start = newlineStart;
    }
    const newlineEnd = tokenEnd(line.newlineToken) + 1;
    if (newlineEnd > end) {
      end = newlineEnd;
    }
  }

  if (!Number.isFinite(start)) {
    start = end = content.length;
  } else if (end === Number.NEGATIVE_INFINITY) {
    end = start;
  }

  const raw = content.slice(start, end);

  if (line.kind === "assignment") {
    const postAssignSpaces = line.postAssignSpaces;
    const valueTokens = line.valueTokens;
    const lastPostAssignSpace =
      postAssignSpaces[postAssignSpaces.length - 1] ?? null;
    const firstValueToken = valueTokens[0] ?? null;
    const lastValueToken =
      valueTokens[valueTokens.length - 1] ?? null;
    const valueStartOffset = firstValueToken
      ? tokenStart(firstValueToken)
      : lastPostAssignSpace
      ? tokenEnd(lastPostAssignSpace) + 1
      : tokenEnd(line.assignToken) + 1;
    const valueEndOffset = lastValueToken
      ? tokenEnd(lastValueToken) + 1
      : valueStartOffset;
    const valueText =
      valueTokens.length > 0
        ? content.slice(valueStartOffset, valueEndOffset)
        : "";

    return {
      ...line,
      startOffset: start,
      endOffset: end,
      raw,
      valueStartOffset,
      valueEndOffset,
      valueText,
    } satisfies ParsedAssignment;
  }

  if (line.kind === "comment") {
    return {
      ...line,
      startOffset: start,
      endOffset: end,
      raw,
    } satisfies ParsedComment;
  }

  if (line.kind === "blank") {
    return {
      ...line,
      startOffset: start,
      endOffset: end,
      raw,
    } satisfies ParsedBlank;
  }

  return {
    ...line,
    startOffset: start,
    endOffset: end,
    raw,
  } satisfies ParsedUnknown;
}

export function parseEnvDocument(content: string): EnvDocument {
  const lexResult = EnvLexer.tokenize(content);

  if (lexResult.errors.length) {
    const message = lexResult.errors
      .map((err) => err.message)
      .join("\n");
    throw new Error(`Failed to lex env file:\n${message}`);
  }

  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.file();

  if (parserInstance.errors.length) {
    const message = parserInstance.errors.map((err) => err.message).join("\n");
    throw new Error(`Failed to parse env file:\n${message}`);
  }

  const lines = (visitorInstance.visit(cst) as EnvLine[]).map((line) =>
    enrichLineMetadata(line, content)
  );

  const assignments = new Map<string, ParsedAssignment>();
  for (const line of lines) {
    if (line.kind === "assignment") {
      assignments.set(line.key, line);
    }
  }

  return {
    content,
    lines,
    assignments,
  };
}
