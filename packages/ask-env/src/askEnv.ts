import {
  SchemaMap,
  intro,
  cancel,
  parseBoolean,
  validateFromSchema,
  outro,
} from ".";
import { z } from "zod";
import { EnvVarSpec } from "./specification/EnvVarSpec";
import { ZodEnvVarSpec } from "./specification/ZodEnvVarSpec";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { OverwritePrompt } from "./prompts/OverwritePrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import { SKIP_SYMBOL } from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { existsSync } from "fs";
import { isCancel } from "@clack/core";
import { EnvPrompt } from "./prompts/EnvPrompt";
import { EnvChannel } from "./channels/EnvChannel";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import type { ChannelOptions } from "./channels/ChannelOptions";
import { resolveChannel } from "./channels/resolveChannel";
import {
  DEFAULT_SECRET_PATTERNS,
  isSecretKey,
  type SecretPattern,
} from "./secret";

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
    )}\n${color.gray("│")}  `
  );

  // Convert ZodObject to SchemaMap if needed
  let schemaMap: SchemaMap;
  if (schemas instanceof z.ZodObject) {
    schemaMap = schemas.shape as SchemaMap;
  } else {
    schemaMap = schemas;
  }

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
  let savedCount = 0;

  for (let index = 0; index < schemaEntries.length; index++) {
    const [key, schema] = schemaEntries[index]!;

    if (index > 0) {
      console.log(`${color.gray("│")}  `);
    }

    const { type, defaultValue, description, required, values } =
      new ZodEnvVarSpec(schema);

    const shouldMask =
      type === "string" && isSecretKey(key, description, secretPatterns);

    // Get current value from the channel for this specific key
    const currentValue = envChannel.get(key);
    const current =
      currentValue && currentValue.trim() !== "" ? currentValue : undefined;

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
        });
        break;
      }
    }
    const value = await prompt.prompt();

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

    // Handle skip symbol
    if (value === SKIP_SYMBOL) {
      continue; // Skip this environment variable
    }

    // Convert value to string for .env file
    const stringValue = String(value);

    // Save the environment variable immediately
    try {
      await envChannel.set(key, stringValue);
      savedCount++;
    } catch (error) {
      cancel(`❌ Failed to save ${key}: ${error}`);
      return;
    }
  }

  // Final success message
  try {
    outro(theme.primary("Setup complete"));
  } catch (error) {
    cancel(`❌ Error displaying final message: ${error}`);
  }
}
