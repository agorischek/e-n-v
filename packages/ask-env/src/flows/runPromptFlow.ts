import { isCancel } from "@clack/core";
import type { Readable } from "node:stream";
import * as color from "picocolors";
import { createPrompt } from "../createPrompt";
import { ZodEnvVarSpec } from "../specification/ZodEnvVarSpec";
import type { SecretPattern, SchemaMap } from "../types";
import { clearConsoleLines } from "../utils/clearConsoleLines";
import { isSecretKey } from "../utils/secrets";
import { S_BAR_END } from "../visuals/symbols";
import type { Theme } from "../visuals/Theme";
import type { EnvChannel } from "../channels/EnvChannel";

export type PromptFlowResult = "success" | "cancelled" | "error";

export interface PromptFlowOptions {
  schemas: SchemaMap;
  channel: EnvChannel;
  secrets: readonly SecretPattern[];
  truncate: number;
  theme: Theme;
  input?: Readable;
  output: NodeJS.WriteStream;
}

export async function runPromptFlow({
  schemas,
  channel,
  secrets,
  truncate,
  theme,
  input,
  output,
}: PromptFlowOptions): Promise<PromptFlowResult> {
  let currentValues = await channel.get();
  const schemaEntries = Object.entries(schemas);
  const newValues: Record<string, string> = {};
  const promptLineHistory: number[] = [];

  let index = 0;
  while (index < schemaEntries.length) {
    const [key, schema] = schemaEntries[index]!;

    let addedLines = 0;

    if (index > 0) {
      output.write(`${color.gray("│")}  \n`);
      addedLines++;
    }

    const { type, defaultValue, description, required, values } =
      new ZodEnvVarSpec(schema);

    const shouldMask =
      type === "string" && isSecretKey(key, description, secrets);

    const storedValue = newValues[key] ?? currentValues[key];
    const current =
      storedValue && storedValue.trim() !== "" ? storedValue : undefined;

    const prompt = createPrompt({
      type,
      key,
      description,
      defaultValue,
      required,
      schema,
      values,
      currentValue: current,
      theme,
      truncate,
      shouldMask,
      hasPrevious: index > 0,
      input,
      output,
    });

    const value = await prompt.prompt();
    addedLines++;
    const outcome = prompt.getOutcome();

    if (
      isCancel(value) ||
      (typeof value === "symbol" &&
        (value as any)?.description === "clack:cancel")
    ) {
      output.write(`${color.red("│")}  \n`);
      output.write(`${color.red("└")}  ${color.red("Setup cancelled.")}\n\n`);
      return "cancelled";
    }

    if (outcome === "previous") {
      clearConsoleLines(addedLines);
      const previousLines = promptLineHistory.pop() ?? 0;
      if (previousLines > 0) {
        clearConsoleLines(previousLines);
      }
      index = Math.max(index - 1, 0);
      continue;
    }

    promptLineHistory.push(addedLines);

    if (outcome === "skip") {
      index++;
      continue;
    }

    const stringValue = String(value);

    try {
      await channel.set({ [key]: stringValue });
      currentValues = await channel.get();
      newValues[key] = stringValue;
    } catch (error) {
      output.write(
        `${color.gray(S_BAR_END)}  ${color.red(
          `Failed to save ${key}: ${error}`
        )}\n\n`
      );
      return "error";
    }

    index++;
  }

  return "success";
}
