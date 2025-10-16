import type { SchemaMap } from "./types";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { stdin, stdout } from "node:process";
import type { AskEnvOptions } from "./AskEnvOptions";
import * as defaults from "./defaults";
import { resolveChannel } from "./channels/resolveChannel";
import { Session } from "./flows/runPromptFlow";

function resolveTheme(themeOption: AskEnvOptions["theme"]): Theme {
  return new Theme(themeOption ?? color.magenta);
}

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function ask(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const path = options.path ??  defaults.ENV_PATH;
  const truncate = options.truncate ?? defaults.TRUNCATE_LENGTH;
  const secrets = options.secrets ?? defaults.SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  const channel = resolveChannel(options.channel, path);
  const theme = resolveTheme(options.theme);

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
