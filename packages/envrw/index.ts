import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";

export type EnvRecord = Record<string, string>;
export type EnvSelectionRecord<T extends readonly string[]> = {
  [K in T[number]]: string | undefined;
};

type PrimitiveEnvValue = string | number | boolean | bigint;

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
    let lines: string[] = [];

    try {
      originalContent = await fs.readFile(this.filePath, "utf8");
      lines = originalContent.split(/\n/);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    const replacements = new Map(entries.map(([key, val]) => [key, val]));
    const touched = new Set<string>();

    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (touched.size === replacements.size) break;
      const line = lines[i]!;
      const parsed = this.parseLine(line);
      if (!parsed) continue;
      const { key } = parsed;
      if (!replacements.has(key) || touched.has(key)) continue;

      const serialized = this.serializeValue(replacements.get(key)!);
      lines[i] = this.buildLineReplacement(line, key, serialized);
      touched.add(key);
    }

    const remaining: string[] = [];
    for (const [key, val] of entries) {
      if (!touched.has(key)) {
        remaining.push(`${key}=${this.serializeValue(val)}`);
      }
    }

    let nextContent = lines.join("\n");
    if (remaining.length > 0) {
      if (nextContent.length > 0 && !nextContent.endsWith("\n")) {
        nextContent += "\n";
      }
      nextContent += `${remaining.join("\n")}\n`;
    } else if (nextContent.length > 0 && !nextContent.endsWith("\n")) {
      nextContent += "\n";
    }

    if (remaining.length === 0 && nextContent === originalContent) {
      return;
    }

    await fs.writeFile(this.filePath, nextContent, "utf8");
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.mkdir(dirname(this.filePath), { recursive: true });
    } catch (error) {
      // ignore directory creation errors; appendFile will surface critical ones
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
    const needsQuotes = /[\s"'\\#]|^$/.test(value) || /[\r\n]/.test(value);
    if (!needsQuotes) {
      return value;
    }

    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  private async readLines(): Promise<string[]> {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      return content.split(/\n/);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private scanAll(lines: string[]): Map<string, string> {
    const result = new Map<string, string>();
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const line = lines[i]!;
      const parsed = this.parseLine(line);
      if (!parsed) continue;
      if (!result.has(parsed.key)) {
        result.set(parsed.key, parsed.value);
      }
    }
    return result;
  }

  private scanForSingle(lines: string[], target: string): string | undefined {
    const name = this.validateKey(target);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const line = lines[i]!;
      const parsed = this.parseLine(line);
      if (!parsed) continue;
      if (parsed.key === name) {
        return parsed.value;
      }
    }
    return undefined;
  }

  private scanForMany(lines: string[], targets: Set<string>): Map<string, string> {
    const normalizedTargets = new Set(targets);

    const found = new Map<string, string>();
    const remaining = new Set(normalizedTargets);

    for (let i = lines.length - 1; i >= 0; i -= 1) {
  if (remaining.size === 0) break;
      const line = lines[i]!;
      const parsed = this.parseLine(line);
      if (!parsed) continue;
      if (!normalizedTargets.has(parsed.key) || found.has(parsed.key)) continue;

      found.set(parsed.key, parsed.value);
      remaining.delete(parsed.key);
    }

    return found;
  }

  private parseLine(line: string): { key: string; value: string } | null {
    if (!line || /^\s*$/.test(line)) {
      return null;
    }

    const trimmedRight = line.replace(/\r$/, "");
    let working = trimmedRight.trim();

    if (!working || working.startsWith("#")) {
      return null;
    }

    if (working.startsWith("export ")) {
      working = working.slice(7).trim();
    }

    const equalsIndex = working.indexOf("=");
    if (equalsIndex === -1) {
      return null;
    }

    const keyPart = working.slice(0, equalsIndex).trim();
    if (!keyPart) {
      return null;
    }

    const valuePart = working.slice(equalsIndex + 1).trim();
    return {
      key: keyPart,
      value: this.normalizeValue(valuePart),
    };
  }

  private buildLineReplacement(original: string, key: string, value: string): string {
    const leadingMatch = original.match(/^\s*/);
    const leading = leadingMatch ? leadingMatch[0] : "";
    let rest = original.slice(leading.length);

    let exportSegment = "";
    if (rest.startsWith("export")) {
      const afterExport = rest.slice("export".length);
      const spacingMatch = afterExport.match(/^\s+/);
      const spacing = spacingMatch ? spacingMatch[0] : " ";
      exportSegment = `export${spacing}`;
    }

    return `${leading}${exportSegment}${key}=${value}`;
  }

  private normalizeValue(value: string): string {
    if (value.length === 0) {
      return "";
    }

    const singleQuoted = value.startsWith("'") && value.endsWith("'");
    const doubleQuoted = value.startsWith('"') && value.endsWith('"');

    if (doubleQuoted) {
      const inner = value.slice(1, -1);
      return inner
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }

    if (singleQuoted) {
      return value.slice(1, -1);
    }

    const commentIndex = value.indexOf(" #");
    const raw = commentIndex !== -1 ? value.slice(0, commentIndex).trimEnd() : value;
    return raw.trim();
  }
}

export default EnvVarSource;
