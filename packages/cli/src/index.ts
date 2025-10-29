import { Command } from "commander";
import { pathToFileURL } from "node:url";
import { isAbsolute, resolve, join } from "node:path";
import { homedir } from "node:os";
import { readdir } from "node:fs/promises";
import type { PromptEnvInteractiveOptions } from "@e-n-v/prompt/options/PromptEnvInteractiveOptions";
import { prompt } from "@e-n-v/prompt";
import { EnvModel } from "@e-n-v/models";
import { register } from "tsx/esm/api";

let tsxRegistered = false;

const DEFAULT_MODEL_BASENAME = "env.model";
const MODEL_EXTENSIONS = [
  ".ts",
  ".mts",
  ".cts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
] as const;
const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
]);
const MAX_MODEL_SEARCH_DEPTH = 6;

function ensureTsxRegistered(): void {
  if (tsxRegistered) {
    return;
  }

  register({
    cwd: process.cwd(),
  });

  tsxRegistered = true;
}

function expandHomePath(input: string): string {
  if (input === "~") {
    return homedir();
  }

  if (input.startsWith("~/")) {
    return join(homedir(), input.slice(2));
  }

  return input;
}

function toAbsolutePath(userInput: string): string {
  const expanded = expandHomePath(userInput);
  return isAbsolute(expanded) ? expanded : resolve(process.cwd(), expanded);
}

function isModelFilename(filename: string): boolean {
  return MODEL_EXTENSIONS.some(
    (extension) => filename === `${DEFAULT_MODEL_BASENAME}${extension}`,
  );
}

async function findDefaultModelPath(root: string): Promise<string | undefined> {
  const queue: Array<{ directory: string; depth: number }> = [
    { directory: root, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    let entries;
    try {
      entries = await readdir(current.directory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.isFile() && isModelFilename(entry.name)) {
        return join(current.directory, entry.name);
      }

      if (
        entry.isDirectory() &&
        current.depth < MAX_MODEL_SEARCH_DEPTH &&
        !IGNORED_DIRECTORIES.has(entry.name)
      ) {
        queue.push({
          directory: join(current.directory, entry.name),
          depth: current.depth + 1,
        });
      }
    }
  }

  return undefined;
}

async function importUserModule(
  modulePath: string,
): Promise<Record<string, unknown>> {
  ensureTsxRegistered();
  const url = pathToFileURL(modulePath).href;
  return import(url);
}

function resolveModel(
  moduleExports: Record<string, unknown>,
  origin: string,
): EnvModel {
  const candidates = [
    moduleExports.default,
    moduleExports.model,
    moduleExports.EnvModel,
  ].concat(Object.values(moduleExports));

  for (const candidate of candidates) {
    if (candidate instanceof EnvModel) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate an EnvModel export in ${origin}`);
}

function resolvePromptOptions(
  moduleExports: Record<string, unknown>,
  origin: string,
): PromptEnvInteractiveOptions {
  const candidates = [
    moduleExports.default,
    moduleExports.config,
    moduleExports.options,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      return candidate as PromptEnvInteractiveOptions;
    }
  }

  for (const value of Object.values(moduleExports)) {
    if (value instanceof EnvModel) {
      continue;
    }

    if (value && typeof value === "object") {
      return value as PromptEnvInteractiveOptions;
    }
  }

  throw new Error(`Unable to locate prompt configuration exports in ${origin}`);
}

async function handleSetupCommand(
  modelPathInput?: string,
  configPathInput?: string,
): Promise<void> {
  const modelPath = modelPathInput
    ? toAbsolutePath(modelPathInput)
    : await findDefaultModelPath(process.cwd());

  if (!modelPath) {
    throw new Error(
      'Unable to locate an EnvModel file. Provide a path or create a file named "env.model.*".',
    );
  }

  const modelModule = await importUserModule(modelPath);
  const model = resolveModel(modelModule, modelPath);

  if (!configPathInput) {
    await prompt(model);
    return;
  }

  const configPath = toAbsolutePath(configPathInput);
  const configModule = await importUserModule(configPath);
  const options = resolvePromptOptions(configModule, configPath);

  await prompt(model, options);
}

export async function run(
  argv: readonly string[] = process.argv,
): Promise<void> {
  const program = new Command();

  program.name("e-n-v").description("Interactive environment setup utilities");

  program
    .command("setup")
    .description("Run the interactive prompt for an EnvModel")
    .argument("[model]", "Path to the module exporting an EnvModel instance")
    .option("--config <path>", "Path to prompt configuration options")
    .action(
      async (modelPath: string | undefined, options: { config?: string }) => {
        try {
          await handleSetupCommand(modelPath, options?.config);
        } catch (error) {
          if (error instanceof Error) {
            program.error(error.message);
            return;
          }

          program.error(String(error));
          return;
        }
      },
    );

  program.showSuggestionAfterError();

  await program.parseAsync(argv);
}
