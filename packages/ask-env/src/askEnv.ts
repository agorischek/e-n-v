import type { SchemaMap } from "./types";
import { ZodEnvVarSpec } from "./specification/ZodEnvVarSpec";
import { S_BAR, S_BAR_END, S_BAR_START } from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { isCancel } from "@clack/core";
import { resolveChannel } from "./channels/resolveChannel";
import { cursorTo, clearLine, moveCursor } from "node:readline";
import { relative } from "node:path";
import { stdout } from "node:process";
import { DEFAULT_SECRET_PATTERNS } from "./constants";
import { isSecretKey } from "./utils/secrets";
import type { AskEnvOptions } from "./AskEnvOptions";
import type { ZodSchema, ZodTypeDef } from "zod";
import type { EnvVarType } from "./specification/EnvVarType";
import { createPrompt } from "./createPrompt";

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const {
    path: envPath = ".env",
    channel,
    truncate = 40,
    secrets = DEFAULT_SECRET_PATTERNS,
    theme,
  } = options;

  const output = stdout;

  const envChannel = resolveChannel(channel, envPath);

  const resolvedTheme = new Theme(theme ?? color.magenta);

  const relativeEnvPath = relative(process.cwd(), envPath);
  const displayEnvPath =
    relativeEnvPath === ""
      ? "."
      : relativeEnvPath.startsWith(".")
      ? relativeEnvPath
      : `./${relativeEnvPath}`;

  output.write(
    `${color.gray(S_BAR_START)}  ${`${resolvedTheme.bgPrimary(
      color.black(" Environment Variable Setup ")
    )}\n${color.gray("│")}  ${color.gray(`${displayEnvPath}`)}\n${color.gray(
      "│"
    )}  `}\n`
  );

  // Get all current values from the channel
  let currentValues = await envChannel.get();

  const schemaEntries = Object.entries(schemas);
  const newValues: Record<string, string> = {};
  const promptLineHistory: number[] = [];

  let index = 0;
  while (index < schemaEntries.length) {
    const [key, schema] = schemaEntries[index]!;

    let addedLines = 0;

    if (index > 0) {
      console.log(`${color.gray("│")}  `);
      addedLines++;
    }

    const { type, defaultValue, description, required, values } =
      new ZodEnvVarSpec(schema);

    const shouldMask =
      type === "string" && isSecretKey(key, description, secrets);

    // Get current value for this specific key from the loaded values
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
      theme: resolvedTheme,
      truncate,
      shouldMask,
      hasPrevious: index > 0,
    });
    const value = await prompt.prompt();
    addedLines++;
    const outcome = prompt.getOutcome();

    // Handle cancellation FIRST - check for clack cancel symbol
    if (
      isCancel(value) ||
      (typeof value === "symbol" &&
        (value as any).description === "clack:cancel")
    ) {
      // Show red vertical pipe and then red L-pipe with cancellation message
      console.log(`${color.red("│")}  `);
      console.log(`${color.red("└")}  ${color.red("Setup cancelled.")}`);
      console.log(); // Add blank line for spacing
      return;
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

    // Handle skip symbol
    if (outcome === "skip") {
      index++;
      continue; // Skip this environment variable
    }

    // Convert value to string for .env file
    const stringValue = String(value);

    // Save the value immediately
    try {
      await envChannel.set({ [key]: stringValue });
      currentValues = await envChannel.get();
      newValues[key] = stringValue;
    } catch (error) {
      output.write(
        `${color.gray(S_BAR_END)}  ${color.red(
          `Failed to save ${key}: ${error}`
        )}\n\n`
      );
      return;
    }
    index++;
  }

  output.write(
    `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  Setup complete\n\n`
  );
}

function clearConsoleLines(lineCount: number): void {
  const output = process.stdout;
  if (!output?.isTTY) {
    return;
  }

  try {
    for (let i = 0; i < lineCount; i++) {
      moveCursor(output, 0, -1);
      cursorTo(output, 0);
      clearLine(output, 0);
    }
    cursorTo(output, 0);
  } catch {
    // If cursor manipulation fails (e.g., non-TTY), ignore and continue.
  }
}
