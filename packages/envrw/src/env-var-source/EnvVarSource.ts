import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";

import type { EnvRecord, EnvSelectionRecord } from "../types/index.ts";

type PrimitiveEnvValue = string | number | boolean | bigint;

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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class EnvVarSource {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = resolve(process.cwd(), filePath);
  }

  async read(): Promise<EnvRecord>;
  async read(name: string): Promise<string | undefined>;
  async read<const Names extends readonly string[]>(names: Names): Promise<EnvSelectionRecord<Names>>;
  async read(arg?: string | readonly string[]): Promise<
    EnvRecord | string | undefined | Record<string, string | undefined>
  > {
    const lines = await this.readLines();

    if (typeof arg === "undefined") {
      const map = this.scanAll(lines);
      return Object.fromEntries(map) as EnvRecord;
    }

    if (typeof arg === "string") {
      return this.scanForSingle(lines, arg);
    }

    const normalizedTargets = Array.from(new Set(arg.map((name) => this.validateKey(name))));
    const lookup = this.scanForMany(lines, new Set(normalizedTargets));

    const ordered: [string, string | undefined][] = normalizedTargets.map((key) => [key, lookup.get(key)]);
    return Object.fromEntries(ordered) as Record<string, string | undefined>;
  }

  async write(name: string, value: PrimitiveEnvValue): Promise<void>;
  async write(values: Record<string, PrimitiveEnvValue>): Promise<void>;
  async write(arg: string | Record<string, PrimitiveEnvValue>, value?: PrimitiveEnvValue): Promise<void> {
    const entries = this.normalizeWriteArguments(arg, value);

    if (entries.length === 0) {
      return;
    }

    await this.ensureDirectory();

    let originalContent = "";
    let normalizedContent = "";
    let lines: string[] = [];

    try {
      originalContent = await fs.readFile(this.filePath, "utf8");
      normalizedContent = originalContent.replace(/\r\n/g, "\n");
      lines = normalizedContent === "" ? [] : normalizedContent.split("\n");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    const replacements = new Map(entries);
    const touched = new Set<string>();

    for (let i = lines.length - 1; i >= 0; ) {
      if (replacements.size === 0) {
        break;
      }

      const parsed = this.parseAssignmentEndingAt(lines, i);
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

      const block = this.buildAssignmentLines(key, nextValue, { leading, exportPrefix, trailing });
      lines.splice(startIndex, endIndex - startIndex + 1, ...block);
      touched.add(key);
      replacements.delete(key);
      i = startIndex - 1;
    }

    for (const [key, val] of entries) {
      if (touched.has(key)) {
        continue;
      }

      const block = this.buildAssignmentLines(key, val);
      const insertIndex = lines.length > 0 && lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
      lines.splice(insertIndex, 0, ...block);
      touched.add(key);
    }

    let nextContent = lines.join("\n");
    if (nextContent.length > 0 && !nextContent.endsWith("\n")) {
      nextContent += "\n";
    }

    if (nextContent === normalizedContent) {
      return;
    }

    await fs.writeFile(this.filePath, nextContent, "utf8");
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.mkdir(dirname(this.filePath), { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }

  private normalizeWriteArguments(arg: string | Record<string, PrimitiveEnvValue>, value?: PrimitiveEnvValue): [string, string][] {
    if (typeof arg === "string") {
      if (typeof value === "undefined") {
        throw new TypeError(`Value for variable "${arg}" must be provided`);
      }
      return [[this.validateKey(arg), this.formatValueInput(value)]];
    }

    if (!isObjectRecord(arg)) {
      throw new TypeError("Argument must be a string name or an object of key-value pairs");
    }

    const entries: [string, string][] = [];
    for (const [key, rawValue] of Object.entries(arg)) {
      if (typeof rawValue === "undefined") {
        throw new TypeError(`Value for variable "${key}" must be provided`);
      }
      entries.push([this.validateKey(key), this.formatValueInput(rawValue)]);
    }
    return entries;
  }

  private validateKey(key: string): string {
    const trimmed = key.trim();
    if (!trimmed) {
      throw new TypeError("Environment variable name cannot be empty");
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
      throw new TypeError(`Invalid environment variable name: ${trimmed}`);
    }
    return trimmed;
  }

  private formatValueInput(value: PrimitiveEnvValue): string {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return String(value);
  }

  private serializeValue(value: string): string {
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

  private async readLines(): Promise<string[]> {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      const normalized = content.replace(/\r\n/g, "\n");
      return normalized === "" ? [] : normalized.split("\n");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private scanAll(lines: string[]): Map<string, string> {
    const result = new Map<string, string>();
    this.iterateAssignments(lines, (assignment) => {
      if (!result.has(assignment.key)) {
        result.set(assignment.key, assignment.value);
      }
    });
    return result;
  }

  private scanForSingle(lines: string[], target: string): string | undefined {
    const name = this.validateKey(target);
    let found: string | undefined;
    this.iterateAssignments(lines, (assignment) => {
      if (assignment.key === name) {
        found = assignment.value;
        return true;
      }
      return undefined;
    });
    return found;
  }

  private scanForMany(lines: string[], targets: Set<string>): Map<string, string> {
    const normalizedTargets = new Set<string>();
    for (const target of targets) {
      normalizedTargets.add(this.validateKey(target));
    }

    const found = new Map<string, string>();
    const remaining = new Set(normalizedTargets);

    this.iterateAssignments(lines, (assignment) => {
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

  private iterateAssignments(
    lines: string[],
    callback: (assignment: ParsedAssignment) => boolean | void | undefined,
  ): void {
    for (let i = lines.length - 1; i >= 0; ) {
      const parsed = this.parseAssignmentEndingAt(lines, i);
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

  private parseAssignmentEndingAt(lines: string[], endIndex: number): ParsedAssignment | null {
    const lastLine = lines[endIndex];
    if (typeof lastLine !== "string" || this.isSkippableLine(lastLine)) {
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

      if (this.containsAssignmentOperator(currentLine)) {
        const parsed = this.tryParseAssignmentBlock(block);
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

  private isSkippableLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.length === 0 || trimmed.startsWith("#");
  }

  private containsAssignmentOperator(line: string): boolean {
    const trimmed = line.trimStart();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return false;
    }

    const commentIndex = trimmed.indexOf("#");
    const inspect = commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex);
    return inspect.includes("=");
  }

  private tryParseAssignmentBlock(blockLines: string[]): Omit<ParsedAssignment, "startIndex" | "endIndex"> | null {
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
    const key = this.validateKey(keyPart.trim());

    const afterEqualsRaw = remainder.slice(equalsIndex + 1);
    const afterEquals = afterEqualsRaw.replace(/^\s+/, "");
    const otherLines = blockLines.slice(1);
    const valueSource = [afterEquals, ...otherLines].join("\n");

    const parsedValue = this.parseValueSource(valueSource);
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

  private parseValueSource(source: string): { value: string; trailing: string } | null {
    if (source.length === 0) {
      return { value: "", trailing: "" };
    }

    const firstChar = source[0];

    if (firstChar === '"') {
      return this.parseDoubleQuotedValue(source);
    }

    if (firstChar === "'") {
      return this.parseSingleQuotedValue(source);
    }

    if (source.includes("\n")) {
      return null;
    }

    const commentIndex = source.indexOf(" #");
    const raw = commentIndex === -1 ? source : source.slice(0, commentIndex);
    const trailing = commentIndex === -1 ? source.slice(raw.length) : source.slice(commentIndex);
    return { value: raw.trim(), trailing };
  }

  private parseDoubleQuotedValue(source: string): { value: string; trailing: string } | null {
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

  private parseSingleQuotedValue(source: string): { value: string; trailing: string } | null {
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

  private buildAssignmentLines(key: string, value: string, style: AssignmentStyle = {}): string[] {
    const leading = style.leading ?? "";
    const exportPrefix = style.exportPrefix ?? "";
    const trailing = style.trailing ?? "";
    const serialized = this.serializeValue(value);
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
}
