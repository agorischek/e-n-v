import {
  intro,
  cancel,
  parseBoolean,
  validateFromSchema,
  outro,
} from ".";
import type { SchemaMap } from ".";
import { z } from "zod";
import { EnvVarSpec } from "./specification/EnvVarSpec";
import { ZodEnvVarSpec } from "./specification/ZodEnvVarSpec";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { OverwritePrompt } from "./prompts/OverwritePrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import { PREVIOUS_SYMBOL, SKIP_SYMBOL } from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { existsSync } from "fs";
import { isCancel } from "@clack/core";
import { EnvPrompt } from "./prompts/EnvPrompt";
import type { EnvChannel } from "./channels/EnvChannel";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import type { ChannelOptions } from "./channels/ChannelOptions";
import { resolveChannel } from "./channels/resolveChannel";
import {
  DEFAULT_SECRET_PATTERNS,
  isSecretKey,
  type SecretPattern,
} from "./secret";
import { cursorTo, clearLine, moveCursor } from "node:readline";

type AskEnvOptions = {
  path?: string;
  channel?: ChannelOptions;
  maxDisplayLength?: number;
  secretPatterns?: Array<SecretPattern>;
};

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap | z.ZodObject<any>,
  options: AskEnvOptions = {}
): Promise<void> {
  const {
    path: envPath = ".env",
    channel,
    maxDisplayLength = 40,
    secretPatterns = DEFAULT_SECRET_PATTERNS,
  } = options;

  // Create channel using the resolver
  const envChannel = resolveChannel(channel, envPath);

  // Create theme object using magenta as the primary color
  const theme = new Theme(color.magenta);

  intro(
    `${theme.bgPrimary(
      color.black(" Environment Variable Setup ")
    )}\n${color.gray("│")}  ${color.gray(`Using file ./${envPath}`)}\n${color.gray("│")}  `
  );

  // Convert ZodObject to SchemaMap if needed
  let schemaMap: SchemaMap;
  if (schemas instanceof z.ZodObject) {
    schemaMap = schemas.shape as SchemaMap;
  } else {
    schemaMap = schemas;
  }

  // Get all current values from the channel
  let currentValues = await envChannel.get();

  // Check if .env file exists (for DefaultEnvChannel only)
  // if (envChannel instanceof DefaultEnvChannel && existsSync(envPath) && !overwrite) {
  //   const confirmPrompt = new OverwritePrompt({
  //     message: `${envPath} already exists. Do you want to overwrite it?`,
  //     theme: theme,
  //   } as any); // ThemedPromptOptions requires render function but OverwritePrompt provides its own

  //   const shouldOverwrite = await confirmPrompt.prompt();

  //   if (isCancel(shouldOverwrite) || !shouldOverwrite) {
  //     cancel("Setup cancelled.");
  //     return;
  //   }
  // }

  const schemaEntries = Object.entries(schemaMap);
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
      type === "string" && isSecretKey(key, description, secretPatterns);

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
          theme: theme,
          maxDisplayLength,
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
          theme: theme,
          maxDisplayLength,
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
          theme: theme,
          maxDisplayLength,
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
          theme: theme,
          maxDisplayLength,
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
      cancel(`❌ Failed to save ${key}: ${error}`);
      return;
    }
    index++;
  }

  // Final success message
  try {
    outro(theme.primary("Setup complete"));
  } catch (error) {
    cancel(`❌ Error displaying final message: ${error}`);
  }
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
