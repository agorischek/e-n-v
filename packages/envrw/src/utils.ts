import type { ParsedAssignment } from "./types.ts";

export function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n");
}

export function splitLines(content: string): string[] {
  return content === "" ? [] : content.split("\n");
}

export function validateKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) {
    throw new TypeError("Environment variable name cannot be empty");
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    throw new TypeError(`Invalid environment variable name: ${trimmed}`);
  }
  return trimmed;
}

export function parseAssignmentEndingAt(lines: string[], endIndex: number): ParsedAssignment | null {
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
      } satisfies ParsedAssignment;
    }

    start -= 1;
  }

  return null;
}

export function isSkippableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length === 0 || trimmed.startsWith("#");
}

export function containsAssignmentOperator(line: string): boolean {
  const trimmed = line.trimStart();
  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return false;
  }

  const commentIndex = trimmed.indexOf("#");
  const inspect = commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex);
  return inspect.includes("=");
}

export function tryParseAssignmentBlock(blockLines: string[]): Omit<ParsedAssignment, "startIndex" | "endIndex"> | null {
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

export function parseValueSource(source: string): { value: string; trailing: string } | null {
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

export function parseDoubleQuotedValue(source: string): { value: string; trailing: string } | null {
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

export function parseSingleQuotedValue(source: string): { value: string; trailing: string } | null {
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
