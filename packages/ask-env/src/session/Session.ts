import { isCancel } from "@clack/core";
import type { Readable } from "node:stream";
import * as color from "picocolors";
import { createPrompt } from "../createPrompt";
import { clearConsoleLines } from "../utils/clearConsoleLines";
import { isSecretKey } from "../utils/secrets";
import { getDisplayEnvPath } from "../utils/getDisplayEnvPath";
import { renderSetupHeader } from "../visuals/renderSetupHeader";
import { S_BAR, S_BAR_END } from "../visuals/symbols";
import type { Theme } from "../visuals/Theme";
import type { EnvChannel } from "@envcredible/types";
import type { EnvVarSchema } from "@envcredible/types";
import type { SecretPattern } from "@envcredible/types";

export type PromptFlowResult = "success" | "cancelled" | "error";

export function resolveShouldMask(
  key: string,
  schema: EnvVarSchema,
  patterns: ReadonlyArray<string | RegExp>,
): boolean {
  if (schema.type !== "string") {
    return false;
  }

  if (typeof schema.secret === "boolean") {
    return schema.secret;
  }

  return isSecretKey(key, schema.description, patterns);
}

export interface SessionOptions {
  schemas: Record<string, EnvVarSchema>;
  channel: EnvChannel;
  secrets: readonly (string | RegExp)[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output: NodeJS.WriteStream;
  path: string;
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
    this.schemas = schemas;
  }

  static fromOptions(options: SessionOptions): Session {
    return new Session(options);
  }
  async run(): Promise<PromptFlowResult> {
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
      `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  Setup complete\n\n`,
    );

    return "success";
  }
}

export async function runPromptFlow(
  options: SessionOptions,
): Promise<PromptFlowResult> {
  const session = Session.fromOptions(options);
  return session.run();
}
