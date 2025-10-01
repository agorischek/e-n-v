import type { SchemaMap } from "./types";
import { ZodEnvVarSpec } from "./specification/ZodEnvVarSpec";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import {
  PREVIOUS_SYMBOL,
  S_BAR,
  S_BAR_END,
  S_BAR_START,
  SKIP_SYMBOL,
} from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { isCancel } from "@clack/core";
import { EnvPrompt } from "./prompts/EnvPrompt";
import { resolveChannel } from "./channels/resolveChannel";
import { cursorTo, clearLine, moveCursor } from "node:readline";
import { relative } from "node:path";
import { parseBoolean } from "./utils/parseBoolean";
import { validateFromSchema } from "./utils/validateFromSchema";
import { stdin, stdout } from "node:process";
import { DEFAULT_SECRET_PATTERNS } from "./constants";
import { isSecretKey } from "./utils/secrets";
import type { AskEnvOptions } from "./AskEnvOptions";

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

    let prompt: EnvPrompt<unknown>;

    switch (type) {
      case "boolean": {
        prompt = new EnvBooleanPrompt({
          key,
          description,
          current: current !== undefined ? parseBoolean(current) : undefined,
          default: typeof defaultValue === "boolean" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: resolvedTheme,
          maxDisplayLength: truncate,
          previousEnabled: index > 0,
        });
        break;
      }

      case "number": {
        prompt = new EnvNumberPrompt({
          key,
          description,
          current: current !== undefined ? parseFloat(current) : undefined,
          default: typeof defaultValue === "number" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: resolvedTheme,
          maxDisplayLength: truncate,
          previousEnabled: index > 0,
        });
        break;
      }

      case "enum": {
        prompt = new EnvEnumPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          options: values || [],
          theme: resolvedTheme,
          maxDisplayLength: truncate,
          previousEnabled: index > 0,
        });
        break;
      }

      default: {
        prompt = new EnvStringPrompt({
          key,
          description,
          current,
          default: typeof defaultValue === "string" ? defaultValue : undefined,
          required,
          validate: validateFromSchema(schema),
          theme: resolvedTheme,
          maxDisplayLength: truncate,
          secret: shouldMask,
          previousEnabled: index > 0,
        });
        break;
      }
    }
    const value = await prompt.prompt();
    addedLines++;

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

    if (value === PREVIOUS_SYMBOL) {
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
    if (value === SKIP_SYMBOL) {
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
