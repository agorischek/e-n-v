import type { EnvPrimitiveValue, EnvRecord, EnvSelectionRecord } from "./types/index.ts";

type AssignmentStyle = {
  leading?: string;
  exportPrefix?: string;
  trailing?: string;
};

type ParsedAssignment = {
  key: string;
  value: string;
  startIndex: number;
  endIndex: number;
  leading: string;
  exportPrefix: string;
  trailing: string;
  lines: string[];
};

export function get(content: string): EnvRecord;
export function get(content: string, name: string): string | undefined;
export function get<const Names extends readonly string[]>(content: string, names: Names): EnvSelectionRecord<Names>;
export function get(
  content: string,
  arg?: string | readonly string[],
): EnvRecord | string | undefined | Record<string, string | undefined> {
  const normalized = normalizeContent(content);
  const lines = splitLines(normalized);

  if (typeof arg === "undefined") {
    const map = scanAll(lines);
    return Object.fromEntries(map) as EnvRecord;
  }

  if (typeof arg === "string") {
    return scanForSingle(lines, arg);
  }

  const normalizedTargets = Array.from(new Set(arg.map((name) => validateKey(name))));
  const lookup = scanForMany(lines, new Set(normalizedTargets));

  const ordered: [string, string | undefined][] = normalizedTargets.map((key) => [key, lookup.get(key)]);
  return Object.fromEntries(ordered) as Record<string, string | undefined>;
}

export function set(content: string, name: string, value: EnvPrimitiveValue): string;
export function set(content: string, values: Record<string, EnvPrimitiveValue>): string;
export function set(
  content: string,
  arg: string | Record<string, EnvPrimitiveValue>,
  value?: EnvPrimitiveValue,
): string {
  const normalized = normalizeContent(content);
  const lines = splitLines(normalized);
  const entries = normalizeWriteArguments(arg, value);

  if (entries.length === 0) {
    return ensureTrailingNewline(normalized);
  }

  const replacements = new Map(entries);
  const touched = new Set<string>();

  for (let i = lines.length - 1; i >= 0; ) {
    if (replacements.size === 0) {
      break;
    }

    const parsed = parseAssignmentEndingAt(lines, i);
    if (!parsed) {
      i -= 1;
      continue;
    }

    const { key, startIndex, endIndex, leading, exportPrefix, trailing, value: currentValue } = parsed;
    const nextValue = replacements.get(key);

    if (typeof nextValue === "undefined" || touched.has(key)) {
      i = startIndex - 1;
      continue;
    }

    if (nextValue === currentValue) {
      touched.add(key);
      replacements.delete(key);
      i = startIndex - 1;
      continue;
    }

    const block = buildAssignmentLines(key, nextValue, { leading, exportPrefix, trailing });
    lines.splice(startIndex, endIndex - startIndex + 1, ...block);
    touched.add(key);
    replacements.delete(key);
    i = startIndex - 1;
  }

  for (const [key, val] of entries) {
    if (touched.has(key)) {
      continue;
    }

    const block = buildAssignmentLines(key, val);
    const insertIndex = lines.length > 0 && lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
    lines.splice(insertIndex, 0, ...block);
    touched.add(key);
  }

  return ensureTrailingNewline(lines.join("\n"));
}

function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n");
}

function splitLines(content: string): string[] {
  return content === "" ? [] : content.split("\n");
}

function ensureTrailingNewline(content: string): string {
  if (content.length === 0) {
    return "";
  }
  if (!content.endsWith("\n")) {
    return `${content}\n`;
  }
  return content;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeWriteArguments(
  arg: string | Record<string, EnvPrimitiveValue>,
  value?: EnvPrimitiveValue,
): [string, string][] {
  if (typeof arg === "string") {
    if (typeof value === "undefined") {
      throw new TypeError(`Value for variable "${arg}" must be provided`);
    }
    return [[validateKey(arg), formatValueInput(value)]];
  }

  if (!isObjectRecord(arg)) {
    throw new TypeError("Argument must be a string name or an object of key-value pairs");
  }

  const entries: [string, string][] = [];
  for (const [key, rawValue] of Object.entries(arg)) {
    if (typeof rawValue === "undefined") {
      throw new TypeError(`Value for variable "${key}" must be provided`);
    }
    entries.push([validateKey(key), formatValueInput(rawValue)]);
  }
  return entries;
}

function validateKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) {
    throw new TypeError("Environment variable name cannot be empty");
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    throw new TypeError(`Invalid environment variable name: ${trimmed}`);
  }
  return trimmed;
}

function formatValueInput(value: EnvPrimitiveValue): string {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return String(value);
}

function serializeValue(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const needsQuotes = normalized.length === 0 || /[\s"'\\#]/.test(normalized) || normalized.includes("\n");

  if (!needsQuotes) {
    return normalized;
  }

  let result = '"';
  for (const char of normalized) {
    if (char === '"') {
      result += '\\"';
      continue;
    }
    if (char === "\\") {
      result += "\\\\";
      continue;
    }
    if (char === "\n") {
      result += "\n";
      continue;
    }
    result += char;
  }
  result += '"';
  return result;
}

function scanAll(lines: string[]): Map<string, string> {
  const result = new Map<string, string>();
  iterateAssignments(lines, (assignment) => {
    if (!result.has(assignment.key)) {
      result.set(assignment.key, assignment.value);
    }
  });
  return result;
}

function scanForSingle(lines: string[], target: string): string | undefined {
  const name = validateKey(target);
  let found: string | undefined;
  iterateAssignments(lines, (assignment) => {
    if (assignment.key === name) {
      found = assignment.value;
      return true;
    }
    return undefined;
  });
  return found;
}

function scanForMany(lines: string[], targets: Set<string>): Map<string, string> {
  const normalizedTargets = new Set<string>();
  for (const target of targets) {
    normalizedTargets.add(validateKey(target));
  }

  const found = new Map<string, string>();
  const remaining = new Set(normalizedTargets);

  iterateAssignments(lines, (assignment) => {
    if (!remaining.has(assignment.key) || found.has(assignment.key)) {
      return;
    }

    found.set(assignment.key, assignment.value);
    remaining.delete(assignment.key);

    if (remaining.size === 0) {
      return true;
    }
    return undefined;
  });

  return found;
}

function iterateAssignments(
  lines: string[],
  callback: (assignment: ParsedAssignment) => boolean | void | undefined,
): void {
  for (let i = lines.length - 1; i >= 0; ) {
    const parsed = parseAssignmentEndingAt(lines, i);
    if (!parsed) {
      i -= 1;
      continue;
    }

    const shouldStop = callback(parsed);
    if (shouldStop === true) {
      return;
    }

    i = parsed.startIndex - 1;
  }
}

function parseAssignmentEndingAt(lines: string[], endIndex: number): ParsedAssignment | null {
  const lastLine = lines[endIndex];
  if (typeof lastLine !== "string" || isSkippableLine(lastLine)) {
    return null;
  }

  const block: string[] = [];
  let start = endIndex;

  while (start >= 0) {
    const currentLine = lines[start];
    if (typeof currentLine !== "string") {
      break;
    }

    block.unshift(currentLine);

    if (containsAssignmentOperator(currentLine)) {
      const parsed = tryParseAssignmentBlock(block);
      if (!parsed) {
        return null;
      }

      return {
        ...parsed,
        startIndex: start,
        endIndex,
      };
    }

    start -= 1;
  }

  return null;
}

function isSkippableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length === 0 || trimmed.startsWith("#");
}

function containsAssignmentOperator(line: string): boolean {
  const trimmed = line.trimStart();
  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return false;
  }

  const commentIndex = trimmed.indexOf("#");
  const inspect = commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex);
  return inspect.includes("=");
}

function tryParseAssignmentBlock(blockLines: string[]): Omit<ParsedAssignment, "startIndex" | "endIndex"> | null {
  if (blockLines.length === 0) {
    return null;
  }

  const firstLine = blockLines[0]!;
  const leadingMatch = firstLine.match(/^\s*/);
  const leading = leadingMatch ? leadingMatch[0] : "";
  let remainder = firstLine.slice(leading.length);

  if (remainder.length === 0 || remainder.startsWith("#")) {
    return null;
  }

  let exportPrefix = "";
  if (remainder.startsWith("export")) {
    const afterExport = remainder.slice("export".length);
    if (/^\s/.test(afterExport)) {
      const spacingMatch = afterExport.match(/^\s+/);
      const spacing = spacingMatch ? spacingMatch[0] : " ";
      exportPrefix = `export${spacing}`;
      remainder = afterExport.slice(spacing.length);
    }
  }

  const equalsIndex = remainder.indexOf("=");
  if (equalsIndex === -1) {
    return null;
  }

  const keyPart = remainder.slice(0, equalsIndex);
  const key = validateKey(keyPart.trim());

  const afterEqualsRaw = remainder.slice(equalsIndex + 1);
  const afterEquals = afterEqualsRaw.replace(/^\s+/, "");
  const otherLines = blockLines.slice(1);
  const valueSource = [afterEquals, ...otherLines].join("\n");

  const parsedValue = parseValueSource(valueSource);
  if (!parsedValue) {
    return null;
  }

  const trailingTrimmed = parsedValue.trailing.trim();
  if (trailingTrimmed.length > 0 && !trailingTrimmed.startsWith("#")) {
    return null;
  }

  return {
    key,
    value: parsedValue.value,
    leading,
    exportPrefix,
    trailing: parsedValue.trailing,
    lines: [...blockLines],
  };
}

function parseValueSource(source: string): { value: string; trailing: string } | null {
  if (source.length === 0) {
    return { value: "", trailing: "" };
  }

  const firstChar = source[0];

  if (firstChar === '"') {
    return parseDoubleQuotedValue(source);
  }

  if (firstChar === "'") {
    return parseSingleQuotedValue(source);
  }

  if (source.includes("\n")) {
    return null;
  }

  const commentIndex = source.indexOf(" #");
  const raw = commentIndex === -1 ? source : source.slice(0, commentIndex);
  const trailing = commentIndex === -1 ? source.slice(raw.length) : source.slice(commentIndex);
  return { value: raw.trim(), trailing };
}

function parseDoubleQuotedValue(source: string): { value: string; trailing: string } | null {
  let value = "";
  let escaping = false;

  for (let i = 1; i < source.length; i += 1) {
    const char = source[i] ?? "";

    if (escaping) {
      switch (char) {
        case "n":
          value += "\n";
          break;
        case "r":
          value += "\r";
          break;
        case "t":
          value += "\t";
          break;
        case '"':
          value += '"';
          break;
        case "\\":
          value += "\\";
          break;
        default:
          value += char;
          break;
      }
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === '"') {
      const trailing = source.slice(i + 1);
      return { value, trailing };
    }

    if (char === "\n") {
      value += "\n";
      continue;
    }

    value += char;
  }

  return null;
}

function parseSingleQuotedValue(source: string): { value: string; trailing: string } | null {
  let value = "";

  for (let i = 1; i < source.length; i += 1) {
    const char = source[i] ?? "";
    if (char === "'") {
      const trailing = source.slice(i + 1);
      return { value, trailing };
    }
    if (char === "\n") {
      value += "\n";
      continue;
    }
    value += char;
  }

  return null;
}

function buildAssignmentLines(key: string, value: string, style: AssignmentStyle = {}): string[] {
  const leading = style.leading ?? "";
  const exportPrefix = style.exportPrefix ?? "";
  const trailing = style.trailing ?? "";
  const serialized = serializeValue(value);
  const segments = serialized.split("\n");

  return segments.map((segment, index) => {
    if (index === 0) {
      const suffix = segments.length === 1 ? trailing : "";
      return `${leading}${exportPrefix}${key}=${segment}${suffix}`;
    }
    if (index === segments.length - 1 && trailing && segments.length > 1) {
      return `${segment}${trailing}`;
    }
    return segment;
  });
}
