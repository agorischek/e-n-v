import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";

import { EnvContent } from "../env-content/index.ts";
import type { EnvPrimitiveValue, EnvRecord, EnvSelectionRecord } from "../types/index.ts";

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
    const text = await this.readContent();
    const envContent = new EnvContent(text);

    if (typeof arg === "undefined") {
      return envContent.get();
    }

    if (typeof arg === "string") {
      return envContent.get(arg);
    }

    return envContent.get(arg);
  }

  async write(name: string, value: EnvPrimitiveValue): Promise<void>;
  async write(values: Record<string, EnvPrimitiveValue>): Promise<void>;
  async write(arg: string | Record<string, EnvPrimitiveValue>, value?: EnvPrimitiveValue): Promise<void> {
    const originalText = await this.readContent();
    const envContent = new EnvContent(originalText);

    if (typeof arg === "string") {
      envContent.set(arg, value!);
    } else {
      envContent.set(arg);
    }

    const nextContent = envContent.toString();
    if (nextContent === originalText) {
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
