import type { EnvVarSchemaMap, SupportedSchema } from "@envcredible/schemata";
import { stdin, stdout } from "node:process";
import type { AskEnvOptions } from "./options/AskEnvOptions";
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
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function ask(
  vars: Record<string, SupportedSchema>,
  options: AskEnvOptions = {}
): Promise<void> {
  const rootDirectory = resolveRootDirectory(options.root);
  const path = resolveEnvFilePath(
    options.path ?? defaults.ENV_PATH,
    rootDirectory
  );
  const truncate = options.truncate ?? defaults.TRUNCATE_LENGTH;
  const secrets = options.secrets ?? defaults.SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  const channel = resolveChannel(options.channel, path);
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
