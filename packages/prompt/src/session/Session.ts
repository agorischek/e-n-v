import { isCancel } from "@clack/core";
import type { Readable } from "node:stream";
import * as color from "picocolors";
import { createPrompt } from "../prompts/create/createPrompt";
import { clearConsoleLines } from "../utils/clearConsoleLines";
import { resolveShouldMask } from "../utils/secrets";
import { getDisplayEnvPath } from "../utils/getDisplayEnvPath";
import { renderSetupHeader } from "../visuals/renderSetupHeader";
import { S_BAR, S_BAR_END } from "../visuals/symbols";
import type { Theme } from "../visuals/Theme";
import type { EnvChannel, Preprocessors } from "@e-n-v/core";
import type { EnvVarSchema } from "@e-n-v/core";
import type { SessionResult } from "./SessionResult";

export interface SessionOptions {
  schemas: Record<string, EnvVarSchema>;
  channel: EnvChannel;
  secrets: readonly (string | RegExp)[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output: NodeJS.WriteStream;
  path: string;
  preprocess?: Preprocessors;
}

export class Session {
  private readonly schemas: Record<string, EnvVarSchema>;
  private readonly newValues: Record<string, string> = {};
  private readonly promptLineHistory: number[] = [];
  private readonly channel: EnvChannel;
  private readonly secrets: readonly (string | RegExp)[];
  private readonly truncate: number;
  private readonly theme: Theme;
  private readonly output: NodeJS.WriteStream;
  private readonly input: Readable | undefined;
  private readonly displayEnvPath: string;
  private readonly preprocessors?: Preprocessors;

  constructor({
    channel,
    secrets,
    truncate,
    theme,
    output,
    input,
    schemas,
    path,
    preprocess,
  }: SessionOptions) {
    this.channel = channel;
    this.secrets = secrets;
    this.truncate = truncate;
    this.theme = theme;
    this.output = output;
    this.input = input;
    this.displayEnvPath = getDisplayEnvPath(path);
    this.schemas = schemas;
    this.preprocessors = preprocess;
  }

  static fromOptions(options: SessionOptions): Session {
    return new Session(options);
  }
  async run(): Promise<SessionResult> {
    renderSetupHeader(this.output, this.theme, this.displayEnvPath);

    let currentValues = await this.channel.get();
    const schemaKeys = Object.keys(this.schemas);
    let index = 0;

    while (index < schemaKeys.length) {
      const key = schemaKeys[index]!;
      const envVarSchema = this.schemas[key]!;

      let addedLines = 0;

      if (index > 0) {
        this.output.write(`${color.gray("│")}  \n`);
        addedLines++;
      }

      const shouldMask = resolveShouldMask(key, envVarSchema, this.secrets);

      const storedValue = this.newValues[key] ?? currentValues[key];
      const current =
        storedValue && storedValue.trim() !== "" ? storedValue : undefined;

      const prompt = createPrompt({
        key,
        schema: envVarSchema,
        currentValue: current,
        theme: this.theme,
        truncate: this.truncate,
        shouldMask,
        index,
        total: schemaKeys.length,
        input: this.input,
        output: this.output,
        preprocessors: this.preprocessors,
      });

      const value = await prompt.prompt();
      addedLines++;
      const outcome = prompt.getOutcome();

      if (
        isCancel(value) ||
        (typeof value === "symbol" &&
          (value as any)?.description === "clack:cancel")
      ) {
        this.output.write(`${color.red("│")}  \n`);
        this.output.write(
          `${color.red("└")}  ${color.red("Setup cancelled.")}\n\n`,
        );
        return "cancelled";
      }

      if (outcome === "previous") {
        clearConsoleLines(addedLines);
        const previousLines = this.promptLineHistory.pop() ?? 0;
        if (previousLines > 0) {
          clearConsoleLines(previousLines);
        }
        index = Math.max(index - 1, 0);
        continue;
      }

      this.promptLineHistory.push(addedLines);

      if (outcome === "skip") {
        index++;
        continue;
      }

      const stringValue = String(value);

      try {
        await this.channel.set({ [key]: stringValue });
        currentValues = await this.channel.get();
        this.newValues[key] = stringValue;
      } catch (error) {
        this.output.write(
          `${color.gray(S_BAR_END)}  ${color.red(
            `Failed to save ${key}: ${error}`,
          )}\n\n`,
        );
        return "error";
      }

      index++;
    }

    this.output.write(
      `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  ${this.theme.primary(
        "Setup complete!",
      )}\n\n`,
    );

    return "success";
  }
}
