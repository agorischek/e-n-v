import type { EnvChannel } from "@e-n-v/core";
import { EnvSource } from "@e-n-v/files";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type {
  DotEnvConfigOptions,
  DotEnvInstance,
  DotEnvParseOptions,
} from "./DotEnvInstance";

function isFileNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function normalizeParsed(
  parsed: Record<string, string | undefined> | undefined,
): Record<string, string> {
  if (!parsed) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "undefined") {
      continue;
    }
    result[key] = value;
  }
  return result;
}

export class DotEnvChannel implements EnvChannel {
  private readonly dotenv: DotEnvInstance;
  private readonly targetPath: string;
  private readonly absolutePath: string;
  private readonly encoding: BufferEncoding;
  private readonly parseOptions: DotEnvParseOptions;
  private readonly envSource: EnvSource;

  constructor(
    dotenv: DotEnvInstance,
    defaultPath: string = ".env",
    getOptions: DotEnvConfigOptions = {},
    parseOptions: DotEnvParseOptions = {},
  ) {
    this.dotenv = dotenv;
    const pathFromOptions =
      typeof getOptions.path === "string" ? getOptions.path : undefined;
    this.targetPath = pathFromOptions ?? defaultPath;
    this.absolutePath = resolve(process.cwd(), this.targetPath);
    const encodingOption = getOptions.encoding as BufferEncoding | undefined;
    this.encoding = encodingOption ?? "utf8";
    this.parseOptions = { ...parseOptions };
    this.envSource = new EnvSource(this.targetPath);
  }

  async get(): Promise<Record<string, string>> {
    try {
      const content = await readFile(this.absolutePath, {
        encoding: this.encoding,
      });
      const parsed = this.dotenv.parse(content, this.parseOptions);
      return normalizeParsed(parsed);
    } catch (error) {
      if (isFileNotFound(error)) {
        return {};
      }
      throw error;
    }
  }

  async set(values: Record<string, string>): Promise<void> {
    await this.envSource.write(values);
  }

  getPrimaryPath(): string {
    return this.targetPath;
  }

  clearCache(): void {}
}
