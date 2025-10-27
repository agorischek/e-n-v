import type { EnvVarSchema } from "@envcredible/core";
import { stdin, stdout } from "node:process";
import type { PromptEnvOptions } from "./options/PromptEnvOptions";
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
 * @param options - Configuration options including vars/spec and other settings
 */
export async function prompt(options: PromptEnvOptions): Promise<void> {
  // Support both legacy vars and new spec
  let schemas: Record<string, EnvVarSchema>;
  let preprocessConfig: any;

  if (options.spec) {
    schemas = options.spec.schemas;
    preprocessConfig = options.preprocess ?? options.spec.preprocess;
  } else if (options.vars) {
    schemas = resolveSchemas(options.vars);
    preprocessConfig = options.preprocess;
  } else {
    throw new Error("Either 'vars' or 'spec' must be provided");
  }

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

  const preprocess = preprocessConfig;

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
