import type { EnvVarSchemaMap, SupportedSchema } from "@envcredible/schemata";
import { stdin, stdout } from "node:process";
import type { AskEnvOptions } from "./options/AskEnvOptions";
import type { EnvChannel } from "@envcredible/core";
import * as defaults from "./options/defaults";
import { resolveChannel } from "@envcredible/channels/resolveChannel";
import { Session } from "./session/Session";
import { resolveSchemas } from "@envcredible/schemata";
import {
  resolveRootDirectory,
  resolveEnvFilePath,
  resolveTheme,
} from "./options/resolve";

/**
 * Type guard to check if a value is an EnvChannel instance
 */
function isEnvChannel(value: unknown): value is EnvChannel {
  return (
    typeof value === "object" &&
    value !== null &&
    "get" in value &&
    "set" in value &&
    typeof value.get === "function" &&
    typeof value.set === "function"
  );
}

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param options - Configuration options including vars and other settings
 */
export async function prompt(options: AskEnvOptions): Promise<void> {
  const { vars } = options;
  const rootDirectory = resolveRootDirectory(options.root);
  const path = resolveEnvFilePath(
    options.path ?? defaults.ENV_PATH,
    rootDirectory,
  );
  const truncate = options.truncate ?? defaults.TRUNCATE_LENGTH;
  const secrets = options.secrets ?? defaults.SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  // If channel is already an EnvChannel instance, use it directly
  // Otherwise, resolve it from the options
  const channel: EnvChannel = isEnvChannel(options.channel)
    ? options.channel
    : resolveChannel(options.channel, path);

  const theme = resolveTheme(options.theme);
  const schemas = resolveSchemas(vars);

  const { preprocess } = options;

  const session = new Session({
    schemas,
    channel,
    secrets,
    truncate,
    theme,
    input,
    output,
    path,
    preprocess,
  });

  await session.run();
}
