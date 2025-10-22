import type { TypedEnvVarSchema } from "@envcredible/core";
import type { EnvVarSchemaMap } from "./types";
import { Theme } from "./visuals/Theme";
import * as color from "picocolors";
import { stdin, stdout } from "node:process";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import type { AskEnvOptions } from "./AskEnvOptions";
import * as defaults from "./defaults";
import { resolveChannel } from "@envcredible/channels/resolveChannel";
import { Session } from "./session/Session";
import { fromZodSchema } from "@envcredible/schematization";
import { isEnvVarSchema } from "@envcredible/schematization";
import { isCompatibleZodSchema } from "@envcredible/schematization";

function resolveTheme(themeOption: AskEnvOptions["theme"]): Theme {
  return new Theme(themeOption ?? color.magenta);
}

function resolveRootDirectory(
  rootOption: AskEnvOptions["root"],
): string | undefined {
  if (!rootOption) {
    return undefined;
  }

  if (rootOption.startsWith("file://")) {
    return dirname(fileURLToPath(rootOption));
  }

  return rootOption;
}

function resolveEnvFilePath(
  pathOption: string,
  rootDir: string | undefined,
): string {
  if (!rootDir) {
    return pathOption;
  }

  return resolvePath(rootDir, pathOption);
}

/**
 * Resolve mixed schema map (Zod schemas or EnvVarSchema) to pure EnvVarSchema map
 */
function resolveSchemas(schemas: EnvVarSchemaMap): Record<string, TypedEnvVarSchema> {
  const resolved: Record<string, TypedEnvVarSchema> = {};
  
  for (const [key, rawSchema] of Object.entries(schemas)) {
    if (isCompatibleZodSchema(rawSchema)) {
      resolved[key] = fromZodSchema(rawSchema);
    } else if (isEnvVarSchema(rawSchema)) {
      resolved[key] = rawSchema;
    } else {
      // Fallback - treat as already resolved
      resolved[key] = rawSchema as TypedEnvVarSchema;
    }
  }
  
  return resolved;
}

/**
 * Interactive CLI tool to generate .env files with Zod schema validation
 * @param schemas - Object mapping environment variable names to Zod schemas, or a ZodObject
 * @param options - Configuration options
 */
export async function ask(
  schemas: EnvVarSchemaMap,
  options: AskEnvOptions = {},
): Promise<void> {
  const rootDirectory = resolveRootDirectory(options.root);
  const envPath = resolveEnvFilePath(
    options.path ?? defaults.ENV_PATH,
    rootDirectory,
  );
  const truncate = options.truncate ?? defaults.TRUNCATE_LENGTH;
  const secrets = options.secrets ?? defaults.SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  const channel = resolveChannel(options.channel, envPath);
  const theme = resolveTheme(options.theme);
  const resolvedSchemas = resolveSchemas(schemas);

  const session = new Session({
    schemas: resolvedSchemas,
    channel,
    secrets,
    truncate,
    theme,
    input,
    output,
    path: envPath,
  });

  await session.run();
}
