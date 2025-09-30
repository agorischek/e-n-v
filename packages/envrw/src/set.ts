import type { AssignmentStyle, EnvPrimitiveValue } from "./types.ts";
import { normalizeContent, parseAssignmentEndingAt, splitLines, validateKey } from "./utils.ts";

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
