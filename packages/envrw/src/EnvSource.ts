import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";

import { get } from "./get.ts";
import { set } from "./set.ts";
import type { EnvPrimitiveValue, EnvRecord, EnvSelectionRecord } from "./types.ts";

export class EnvSource {
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
    const content = await this.readContent();

    if (typeof arg === "undefined") {
      return get(content);
    }

    if (typeof arg === "string") {
      return get(content, arg);
    }

    return get(content, arg);
  }

  async write(name: string, value: EnvPrimitiveValue): Promise<void>;
  async write(values: Record<string, EnvPrimitiveValue>): Promise<void>;
  async write(arg: string | Record<string, EnvPrimitiveValue>, value?: EnvPrimitiveValue): Promise<void> {
    const originalContent = await this.readContent();

    let nextContent: string;
    if (typeof arg === "string") {
      nextContent = set(originalContent, arg, value!);
    } else {
      nextContent = set(originalContent, arg);
    }
    if (nextContent === originalContent) {
      return;
    }

    await this.ensureDirectory();
    await fs.writeFile(this.filePath, nextContent, "utf8");
  }

  private async readContent(): Promise<string> {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      return content.replace(/\r\n/g, "\n");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return "";
      }
      throw error;
    }
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
}
