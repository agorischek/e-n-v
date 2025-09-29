import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import chokidar, { FSWatcher } from "chokidar";
import {
  EnvDocument,
  ParsedAssignment,
  parseEnvDocument,
} from "./envParser";

export type EnvReadKey = string | string[] | undefined;

export interface EnvWriteMap {
  [key: string]: string;
}

type EnvChangeCallback = () => void | Promise<void>;
type EnvKeyChangeCallback = (value: string | undefined) => void | Promise<void>;
export type EnvUnlisten = () => Promise<void>;

export class EnvSource {
  constructor(private readonly filePath: string) {}

  private watcher: FSWatcher | null = null;
  private watcherReady: Promise<void> | null = null;
  private lastSnapshot: Map<string, string> | null = null;
  private changeChain: Promise<void> = Promise.resolve();
  private allListeners = new Set<EnvChangeCallback>();
  private keyListeners = new Map<string, Set<EnvKeyChangeCallback>>();

  async read(): Promise<Record<string, string>>;
  async read(key: string): Promise<string | undefined>;
  async read(keys: string[]): Promise<Record<string, string | undefined>>;
  async read(arg?: EnvReadKey): Promise<any> {
    const content = await this.readFile();
    const document = parseEnvDocument(content);
    const map = collectAssignments(document);

    if (typeof arg === "string") {
      return map.get(arg);
    }

    if (Array.isArray(arg)) {
      const result: Record<string, string | undefined> = {};
      for (const key of arg) {
        result[key] = map.get(key);
      }
      return result;
    }

    const result: Record<string, string> = {};
    for (const [key, value] of map.entries()) {
      result[key] = value;
    }
    return result;
  }

  async write(key: string, value: string): Promise<void>;
  async write(values: EnvWriteMap): Promise<void>;
  async write(arg1: string | EnvWriteMap, arg2?: string): Promise<void> {
    const updates = normalizeWriteArguments(arg1, arg2);

    if (Object.keys(updates).length === 0) {
      return;
    }

    const originalContent = await this.readFile();
    const document = parseEnvDocument(originalContent);
    const mutations = buildMutations(document, updates);

    if (!mutations.changed && mutations.appendLines.length === 0) {
      return;
    }

    let nextContent = applyPatches(originalContent, mutations.patches);

    if (mutations.appendLines.length > 0) {
      const baseline = nextContent.length > 0 ? nextContent : originalContent;
      const lineEnding = detectLineEnding(baseline);
      const appendBlock = ensureTrailingLineEnding(
        mutations.appendLines.join(lineEnding),
        lineEnding
      );

      if (
        nextContent.length > 0 &&
        !endsWithLineEnding(nextContent, lineEnding)
      ) {
        nextContent += lineEnding;
      }

      nextContent += appendBlock;
    }

    await ensureDirectory(this.filePath);
    await writeFile(this.filePath, nextContent, "utf8");
  }

  async listen(callback: EnvChangeCallback): Promise<EnvUnlisten>;
  async listen(
    key: string,
    callback: EnvKeyChangeCallback
  ): Promise<EnvUnlisten>;
  async listen(
    arg1: string | EnvChangeCallback,
    arg2?: EnvKeyChangeCallback
  ): Promise<EnvUnlisten> {
    await this.ensureWatcher();

    if (typeof arg1 === "string") {
      if (typeof arg2 !== "function") {
        throw new TypeError("A callback function must be provided when listening to a specific key");
      }

      const key = arg1;
      const callback = arg2;
      let listeners = this.keyListeners.get(key);
      if (!listeners) {
        listeners = new Set();
        this.keyListeners.set(key, listeners);
      }
      listeners.add(callback);

      return async () => {
        const current = this.keyListeners.get(key);
        if (current) {
          current.delete(callback);
          if (current.size === 0) {
            this.keyListeners.delete(key);
          }
        }
        await this.cleanupWatcherIfIdle();
      };
    }

    const callback = arg1;
    this.allListeners.add(callback);

    return async () => {
      this.allListeners.delete(callback);
      await this.cleanupWatcherIfIdle();
    };
  }

  private async readFile(): Promise<string> {
    try {
      return await readFile(this.filePath, "utf8");
    } catch (error) {
      if (isNotFoundError(error)) {
        return "";
      }
      throw error;
    }
  }

  private async ensureWatcher(): Promise<void> {
    if (this.watcher) {
      if (this.watcherReady) {
        await this.watcherReady.catch(() => undefined);
      }
      return;
    }

    if (!this.watcherReady) {
      this.watcherReady = (async () => {
        this.lastSnapshot =
          (await this.loadAssignments()) ?? new Map<string, string>();

        const watcher = chokidar.watch(this.filePath, {
          ignoreInitial: true,
          awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
        });

        watcher.on("add", () => this.scheduleRefresh());
        watcher.on("change", () => this.scheduleRefresh());
        watcher.on("unlink", () => this.scheduleRefresh());
        watcher.on("error", (error) => {
          console.error(
            `[EnvSource] watcher error for ${this.filePath}:`,
            error
          );
        });

        this.watcher = watcher;

        await new Promise<void>((resolve) => watcher.once("ready", resolve));
      })();
    }

    if (this.watcherReady) {
      await this.watcherReady.catch(() => undefined);
    }
  }

  private scheduleRefresh(): void {
    this.changeChain = this.changeChain
      .then(() => this.processChange())
      .catch((error) => {
        console.error(
          `[EnvSource] failed to process env change for ${this.filePath}:`,
          error
        );
      });
  }

  private async processChange(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    const nextSnapshot = await this.loadAssignments();
    if (!nextSnapshot) {
      return;
    }

    const previous = this.lastSnapshot
      ? new Map(this.lastSnapshot.entries())
      : new Map<string, string>();

    if (this.lastSnapshot && mapsEqual(this.lastSnapshot, nextSnapshot)) {
      return;
    }

    this.lastSnapshot = nextSnapshot;
    await this.emitChanges(previous, nextSnapshot);
  }

  private async emitChanges(
    previous: Map<string, string>,
    next: Map<string, string>
  ): Promise<void> {
    if (this.allListeners.size === 0 && this.keyListeners.size === 0) {
      return;
    }

    for (const listener of [...this.allListeners]) {
      await runCallback(listener, this.filePath);
    }

    if (this.keyListeners.size === 0) {
      return;
    }

    for (const [key, listeners] of this.keyListeners.entries()) {
      if (!listeners || listeners.size === 0) {
        continue;
      }
      const previousValue = previous.has(key)
        ? previous.get(key)
        : undefined;
      const nextValue = next.has(key) ? next.get(key) : undefined;

      if (previousValue === nextValue) {
        continue;
      }

      for (const listener of [...listeners]) {
        await runCallback(() => listener(nextValue), this.filePath);
      }
    }
  }

  private async loadAssignments(): Promise<Map<string, string> | null> {
    try {
      const content = await this.readFile();
      const document = parseEnvDocument(content);
      return collectAssignments(document);
    } catch {
      return null;
    }
  }

  private async cleanupWatcherIfIdle(): Promise<void> {
    if (this.allListeners.size === 0 && this.keyListeners.size === 0) {
      await this.disposeWatcher();
      this.lastSnapshot = null;
    }
  }

  private async disposeWatcher(): Promise<void> {
    if (!this.watcher) {
      this.watcherReady = null;
      return;
    }

    const watcher = this.watcher;
    this.watcher = null;
    this.watcherReady = null;
    this.changeChain = Promise.resolve();
    await watcher.close();
  }
}

function collectAssignments(document: EnvDocument): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, assignment] of document.assignments.entries()) {
    map.set(key, decodeValue(assignment.valueText));
  }
  return map;
}

function normalizeWriteArguments(
  arg1: string | EnvWriteMap,
  arg2?: string
): EnvWriteMap {
  if (typeof arg1 === "string") {
    if (typeof arg2 !== "string") {
      throw new TypeError("A value must be provided when key is a string");
    }
    return { [arg1]: arg2 };
  }

  const entries = Object.entries(arg1);
  for (const [key, value] of entries) {
    if (typeof value !== "string") {
      throw new TypeError(`Expected string value for key ${key}`);
    }
  }
  return arg1;
}

interface Patch {
  start: number;
  end: number;
  text: string;
}

interface Mutations {
  changed: boolean;
  patches: Patch[];
  appendLines: string[];
}

function buildMutations(
  document: EnvDocument,
  updates: EnvWriteMap
): Mutations {
  const patches: Patch[] = [];
  const appendLines: string[] = [];
  let changed = false;

  for (const [key, value] of Object.entries(updates)) {
    const assignment = document.assignments.get(key);
    if (assignment) {
      const { valuePart, commentPart } = splitValueComment(
        assignment.valueText
      );
      const serializedValue = encodeValue(
        value,
        valuePart.length > 0 ? valuePart : null
      );
      const nextRawValue = `${serializedValue}${commentPart}`;

      if (assignment.valueText === nextRawValue) {
        continue;
      }

      patches.push({
        start: assignment.valueStartOffset,
        end: assignment.valueEndOffset,
        text: nextRawValue,
      });
      changed = true;
    } else {
      const serialized = encodeValue(value, null);
      appendLines.push(formatAssignmentLine(key, serialized));
      changed = true;
    }
  }

  return { changed, patches, appendLines };
}

function applyPatches(content: string, patches: Patch[]): string {
  if (patches.length === 0) {
    return content;
  }

  const sorted = [...patches].sort((a, b) => b.start - a.start);
  let result = content;

  for (const patch of sorted) {
    result = `${result.slice(0, patch.start)}${patch.text}${result.slice(patch.end)}`;
  }

  return result;
}

function detectLineEnding(content: string): "\n" | "\r\n" {
  if (content.includes("\r\n")) {
    return "\r\n";
  }
  return "\n";
}

function endsWithLineEnding(content: string, lineEnding: string): boolean {
  if (lineEnding === "\r\n") {
    return content.endsWith("\r\n");
  }
  return content.endsWith("\n");
}

function ensureTrailingLineEnding(text: string, lineEnding: string): string {
  if (endsWithLineEnding(text, lineEnding)) {
    return text;
  }
  return `${text}${lineEnding}`;
}

async function ensureDirectory(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === "object" && "code" in error && (error as any).code === "ENOENT");
}

function formatAssignmentLine(key: string, value: string): string {
  return `${key}=${value}`;
}

function decodeValue(raw: string): string {
  if (!raw) {
    return "";
  }

  const { valuePart } = splitValueComment(raw);

  if (valuePart.startsWith("\"") && valuePart.endsWith("\"")) {
    const inner = valuePart.slice(1, -1);
    return inner
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\\"/g, '"');
  }

  if (valuePart.startsWith("'") && valuePart.endsWith("'")) {
    return valuePart.slice(1, -1);
  }

  return valuePart;
}

function needsQuoting(value: string): boolean {
  if (value === "") {
    return false;
  }
  return /\s|#|=|\"|\n|\r/.test(value);
}

function encodeValue(value: string, existingRaw: string | null): string {
  const preferredStyle = existingRaw ? detectStyle(existingRaw) : null;
  const style = chooseStyle(value, preferredStyle);

  if (style === "none") {
    return value;
  }

  if (style === "single") {
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  return `"${escapeDoubleQuoted(value)}"`;
}

type QuoteStyle = "single" | "double" | "none";

function detectStyle(raw: string): QuoteStyle {
  if (raw.startsWith("\"") && raw.endsWith("\"")) {
    return "double";
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return "single";
  }
  return "none";
}

function chooseStyle(value: string, preferred: QuoteStyle | null): QuoteStyle {
  if (preferred && canUseStyle(preferred, value)) {
    return preferred;
  }

  if (!needsQuoting(value)) {
    return "none";
  }

  if (canUseStyle("single", value)) {
    return "single";
  }

  return "double";
}

function canUseStyle(style: QuoteStyle, value: string): boolean {
  if (style === "none") {
    return !needsQuoting(value);
  }

  if (style === "single") {
    return !value.includes("'") && !value.includes("\n") && !value.includes("\r");
  }

  return true;
}

function escapeDoubleQuoted(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\"/g, '\\"');
}

function mapsEqual(a: Map<string, string>, b: Map<string, string>): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const [key, value] of a.entries()) {
    if (b.get(key) !== value) {
      return false;
    }
  }

  return true;
}

async function runCallback(
  callback: () => void | Promise<void>,
  filePath: string
): Promise<void> {
  try {
    await callback();
  } catch (error) {
    console.error(`[EnvSource] listener callback failed for ${filePath}:`, error);
  }
}

function splitValueComment(raw: string): { valuePart: string; commentPart: string } {
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle && !isEscaped(raw, index)) {
      inDouble = !inDouble;
    }

    if (!inSingle && !inDouble && char === "#") {
      let commentStart = index;
      while (
        commentStart > 0 &&
        (raw[commentStart - 1] === " " || raw[commentStart - 1] === "\t")
      ) {
        commentStart -= 1;
      }

      return {
        valuePart: raw.slice(0, commentStart),
        commentPart: raw.slice(commentStart),
      };
    }
  }

  return { valuePart: raw, commentPart: "" };
}

function isEscaped(raw: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && raw[i] === "\\"; i -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}
