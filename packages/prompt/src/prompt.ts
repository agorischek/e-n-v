import type { EnvVarSchema } from "@e-n-v/core";
import { stdin, stdout } from "node:process";
import type { PromptEnvOptions } from "./options/PromptEnvOptions";
import type { PromptEnvInteractiveOptions } from "./options/PromptEnvInteractiveOptions";
import type { EnvChannel } from "@e-n-v/core";
import { EnvModel, type ClientServerSchemas } from "@e-n-v/models";
import * as defaults from "./options/defaults";
import { resolveChannel } from "@e-n-v/channels/resolveChannel";
import { Session } from "./session/Session";
import { resolveSchemas } from "@e-n-v/models";
import {
  resolveRootDirectory,
  resolveEnvFilePath,
  resolveTheme,
} from "./options/resolve";
import { isEnvChannel } from "./utils/isEnvChannel";

/**
 * Interactive CLI tool to generate .env files with schema validation
 * @param model - Environment model instance
 * @param options - Interactive configuration options
 */
export async function prompt(
  model: EnvModel,
  options?: PromptEnvInteractiveOptions,
): Promise<void>;

/**
 * Interactive CLI tool to generate .env files with schema validation
 * @param options - Configuration options including schemas and interactive settings
 */
export async function prompt(options: PromptEnvOptions): Promise<void>;

/**
 * Interactive CLI tool to generate .env files with schema validation (client-server format)
 * @param schemas - Client and server schema definitions
 * @param options - Interactive configuration options with format set to "client-server"
 */
export async function prompt(
  schemas: ClientServerSchemas,
  options: PromptEnvInteractiveOptions & { format: "client-server" },
): Promise<void>;

/**
 * Interactive CLI tool to generate .env files with schema validation
 */
export async function prompt(
  modelOrOptionsOrSchemas: EnvModel | PromptEnvOptions | ClientServerSchemas,
  interactiveOptions?: PromptEnvInteractiveOptions,
): Promise<void> {
  let schemas: Record<string, EnvVarSchema>;
  let preprocessConfig: any;
  let finalOptions: PromptEnvInteractiveOptions;

  // Determine which overload is being used
  if (modelOrOptionsOrSchemas instanceof EnvModel) {
    // First overload: (model, options?)
    const model = modelOrOptionsOrSchemas;
    finalOptions = interactiveOptions || {};
    schemas = model.schemas;
    preprocessConfig = model.preprocess;
  } else if (
    typeof modelOrOptionsOrSchemas === "object" &&
    "client" in modelOrOptionsOrSchemas &&
    "server" in modelOrOptionsOrSchemas &&
    interactiveOptions?.format === "client-server"
  ) {
    // Third overload: (ClientServerSchemas, options with format: "client-server")
    const clientServerSchemas = modelOrOptionsOrSchemas as ClientServerSchemas;
    finalOptions = interactiveOptions;

    // Check for duplicate keys
    const clientKeys = new Set(Object.keys(clientServerSchemas.client));
    const serverKeys = new Set(Object.keys(clientServerSchemas.server));
    const duplicates = [...clientKeys].filter((key) => serverKeys.has(key));

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate keys found in client and server schemas: ${duplicates.join(", ")}`,
      );
    }

    // Merge client and server schemas
    const mergedSchemas = {
      ...clientServerSchemas.client,
      ...clientServerSchemas.server,
    };
    schemas = resolveSchemas(mergedSchemas);
    preprocessConfig = undefined;
  } else {
    // Second overload: (options)
    const options = modelOrOptionsOrSchemas as PromptEnvOptions;
    finalOptions = options;

    if (options.schemas) {
      schemas = resolveSchemas(options.schemas);
      preprocessConfig = options.preprocess;
    } else {
      throw new Error("Either provide a model or schemas in options");
    }
  }

  const rootDirectory = resolveRootDirectory(finalOptions.root);
  const path = resolveEnvFilePath(
    finalOptions.path ?? defaults.ENV_PATH,
    rootDirectory,
  );
  const truncate = finalOptions.truncate ?? defaults.TRUNCATE_LENGTH;
  const secrets = finalOptions.secrets ?? defaults.SECRET_PATTERNS;

  const input = stdin;
  const output = stdout;

  // If channel is already an EnvChannel instance, use it directly
  // Otherwise, resolve it from the options
  const channel: EnvChannel = isEnvChannel(finalOptions.channel)
    ? finalOptions.channel
    : resolveChannel(finalOptions.channel, path);

  const theme = resolveTheme(finalOptions.theme);

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
