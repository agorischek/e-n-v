import type { SchemaMap } from "./types";
import { S_BAR, S_BAR_END } from "./visuals/symbols";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { stdin, stdout } from "node:process";
import type { AskEnvOptions } from "./AskEnvOptions";
import { DEFAULT_SECRET_PATTERNS } from "./constants";
import { resolveChannel } from "./channels/resolveChannel";
import { runPromptFlow } from "./flows/runPromptFlow";
import { renderSetupHeader } from "./visuals/renderSetupHeader";
import { getDisplayEnvPath } from "./utils/getDisplayEnvPath";

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function askEnv(
  schemas: SchemaMap,
  options: AskEnvOptions = {}
): Promise<void> {
  const path = options.path ?? ".env";
  const truncate = options.truncate ?? 40;
  const secrets = options.secrets ?? DEFAULT_SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  const channel = resolveChannel(options.channel, path);

  const theme = new Theme(options.theme ?? color.magenta);
  const displayEnvPath = getDisplayEnvPath(path);

  renderSetupHeader(output, theme, displayEnvPath);

  const result = await runPromptFlow({
    schemas,
    channel,
    secrets,
    truncate,
    theme,
    input,
    output,
  });

  if (result !== "success") {
    return;
  }

  output.write(
    `${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  Setup complete\n\n`
  );
}
