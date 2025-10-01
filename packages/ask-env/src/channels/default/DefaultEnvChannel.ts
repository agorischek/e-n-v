import type { EnvChannel } from "../EnvChannel";
import { EnvSource } from "../../../../envrw/src/index";
import { readFileSync, writeFileSync } from "node:fs";
import type { EnvPrimitiveValue } from "../../../../envrw/src/index";

/**
 * Default implementation of EnvChannel that works with .env files using envrw
 */
export class DefaultEnvChannel implements EnvChannel {
  private envSource: EnvSource;

  /**
   * Create a new DefaultEnvChannel
   * @param filePath - Path to the .env file to manage
   */
  constructor(filePath: string) {
    this.envSource = new EnvSource(filePath);
  }

  /**
   * Get all environment variables
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  async get(): Promise<Record<string, string>> {
    return await this.envSource.read();
  }

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  async set(values: Record<string, string>): Promise<void> {
    await this.envSource.write(values);
  }
}

function readEnvFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function writeEnvFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf8");
}

function serializeValue(value: EnvPrimitiveValue): string {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const stringValue = String(value);
  if (stringValue === "") {
    return "";
  }

  const needsQuotes = /[\s"]/u.test(stringValue);
  if (!needsQuotes) {
    return stringValue;
  }

  let result = "";
  for (const char of stringValue) {
    if (char === "\"") {
      result += '\\"';
    } else {
      result += char;
    }
  }
  return `"${result}"`;
}

function splitValueAndComment(segment: string): { comment: string } {
  let inQuotes = false;
  let escaped = false;

  for (let index = 0; index < segment.length; index++) {
    const char = segment[index]!;
    if (char === "\\" && inQuotes && !escaped) {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      if (!escaped) {
        inQuotes = !inQuotes;
      }
      escaped = false;
      continue;
    }

    escaped = false;

    if (char === "#" && !inQuotes) {
      const previous = index > 0 ? segment[index - 1]! : undefined;
      if (index > 0 && previous && !/\s/u.test(previous)) {
        continue;
      }

      let commentStart = index;
      while (commentStart > 0 && /\s/u.test(segment[commentStart - 1]!)) {
        commentStart -= 1;
      }

      return { comment: segment.slice(commentStart) };
    }
  }

  return { comment: "" };
}

function normalizeNewlineAppend(content: string): string[] {
  if (content.trim().length === 0) {
    return [];
  }

  const lines = content.split("\n");
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

export function updateEnvContentValue(
  content: string,
  key: string,
  value: EnvPrimitiveValue,
): string {
  const lines = content.split("\n");
  const formattedValue = serializeValue(value);

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const prefix = line.slice(0, equalsIndex);
    const trimmedPrefix = prefix.trim();
    if (trimmedPrefix.length === 0) {
      continue;
    }

    let keyCandidate = trimmedPrefix;
    const exportMatch = /^export\b\s*/u.exec(keyCandidate);
    if (exportMatch) {
      keyCandidate = keyCandidate.slice(exportMatch[0].length).trim();
    }

    if (keyCandidate !== key) {
      continue;
    }

    const afterEquals = line.slice(equalsIndex + 1);
    const leadingWhitespaceMatch = afterEquals.match(/^\s*/u);
    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : "";
    const remainder = afterEquals.slice(leadingWhitespace.length);
    const { comment } = splitValueAndComment(remainder);

    lines[index] = `${prefix}=${leadingWhitespace}${formattedValue}${comment}`;
    return lines.join("\n");
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return `${key}=${formattedValue}`;
  }

  const baseLines = normalizeNewlineAppend(content);
  baseLines.push("");
  baseLines.push(`${key}=${formattedValue}`);
  return baseLines.join("\n");
}

export function updateEnvValue(
  filePath: string,
  key: string,
  value: EnvPrimitiveValue,
): void {
  const original = readEnvFile(filePath);
  const updated = updateEnvContentValue(original, key, value);
  writeEnvFile(filePath, updated);
}

export function updateEnvValues(
  filePath: string,
  values: Record<string, EnvPrimitiveValue>,
): void {
  let content = readEnvFile(filePath);
  for (const [name, val] of Object.entries(values)) {
    content = updateEnvContentValue(content, name, val);
  }
  writeEnvFile(filePath, content);
}