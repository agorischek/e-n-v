import { isCancel } from "@clack/core";
import type { Readable } from "node:stream";
import * as color from "picocolors";
import { createPrompt } from "../createPrompt";
import { fromZodSchema } from "../specification/fromZodSchema";
import type { SecretPattern, SchemaMap } from "../types";
import { clearConsoleLines } from "../utils/clearConsoleLines";
import { isSecretKey } from "../utils/secrets";
import { getDisplayEnvPath } from "../utils/getDisplayEnvPath";
import { renderSetupHeader } from "../visuals/renderSetupHeader";
import { S_BAR, S_BAR_END } from "../visuals/symbols";
import type { Theme } from "../visuals/Theme";
import type { EnvChannel } from "../channels/EnvChannel";

export type PromptFlowResult = "success" | "cancelled" | "error";

export interface SessionOptions {
  schemas: SchemaMap;
  channel: EnvChannel;
  secrets: readonly SecretPattern[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output: NodeJS.WriteStream;
  path: string;
}

export class Session {
  private readonly schemaEntries: Array<[string, SchemaMap[keyof SchemaMap]]>;
  private readonly newValues: Record<string, string> = {};
  private readonly promptLineHistory: number[] = [];
  private readonly channel: EnvChannel;
  private readonly secrets: readonly SecretPattern[];
  private readonly truncate: number;
  private readonly theme: Theme;
  private readonly output: NodeJS.WriteStream;
  private readonly input: Readable | undefined;
  private readonly displayEnvPath: string;

  constructor({
    channel,
    secrets,
    truncate,
    theme,
    output,
    input,
    schemas,
    path,
  }: SessionOptions) {
    this.channel = channel;
    this.secrets = secrets;
    this.truncate = truncate;
    this.theme = theme;
    this.output = output;
    this.input = input;
    this.displayEnvPath = getDisplayEnvPath(path);
    this.schemaEntries = Object.entries(schemas);
  }

  static fromOptions(options: SessionOptions): Session {
    return new Session(options);
  }
  async run(): Promise<PromptFlowResult> {
    renderSetupHeader(this.output, this.theme, this.displayEnvPath);

    let currentValues = await this.channel.get();
    let index = 0;

    while (index < this.schemaEntries.length) {
      const [key, schema] = this.schemaEntries[index]!;

      let addedLines = 0;

      if (index > 0) {
        this.output.write(`${color.gray("│")}  \n`);
        addedLines++;
      }

      const envVarSchema = fromZodSchema(schema);

      const shouldMask =
        envVarSchema.type === "string" &&
        isSecretKey(key, envVarSchema.description, this.secrets);

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
        hasPrevious: index > 0,
        input: this.input,
        output: this.output,
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
          `${color.red("└")}  ${color.red("Setup cancelled.")}\n\n`
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
            `Failed to save ${key}: ${error}`
          )}\n\n`
        );
        return "error";
      }

      index++;
    }

    this.output.write(
      `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  Setup complete\n\n`
    );

    return "success";
  }
}

export async function runPromptFlow(
  options: SessionOptions
): Promise<PromptFlowResult> {
  const session = Session.fromOptions(options);
  return session.run();
}
