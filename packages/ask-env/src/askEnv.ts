import type { SchemaMap } from "./types";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { stdin, stdout } from "node:process";
import type { AskEnvOptions } from "./AskEnvOptions";
import {
  DEFAULT_ENV_PATH,
  DEFAULT_TRUNCATE_LENGTH,
  DEFAULT_SECRET_PATTERNS,
} from "./constants";
import { resolveChannel } from "./channels/resolveChannel";
import { Session } from "./flows/runPromptFlow";

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const path = options.path ?? DEFAULT_ENV_PATH;
  const truncate = options.truncate ?? DEFAULT_TRUNCATE_LENGTH;
  const secrets = options.secrets ?? DEFAULT_SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  const channel = resolveChannel(options.channel, path);

  const theme = new Theme(options.theme ?? color.magenta);

  const session = new Session({
    schemas,
    channel,
    secrets,
    truncate,
    theme,
    input,
    output,
    path,
  });
  
  await session.run();
}
