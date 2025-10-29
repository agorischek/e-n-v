import { Command } from "commander";
import { pathToFileURL } from "node:url";
import { isAbsolute, resolve, join } from "node:path";
import { homedir } from "node:os";
import type { PromptEnvInteractiveOptions } from "@e-n-v/prompt/options/PromptEnvInteractiveOptions";
import { prompt } from "@e-n-v/prompt";
import { EnvModel } from "@e-n-v/models";
import { register } from "tsx/esm/api";

let tsxRegistered = false;

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

async function importUserModule(modulePath: string): Promise<Record<string, unknown>> {
  ensureTsxRegistered();
  const url = pathToFileURL(modulePath).href;
  return import(url);
}

function resolveModel(moduleExports: Record<string, unknown>, origin: string): EnvModel {
  const candidates = [moduleExports.default, moduleExports.model, moduleExports.EnvModel]
    .concat(Object.values(moduleExports));

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
  const candidates = [moduleExports.default, moduleExports.config, moduleExports.options];

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

async function handleSetupCommand(modelPathInput: string, configPathInput?: string): Promise<void> {
  const modelPath = toAbsolutePath(modelPathInput);
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

export async function run(argv: readonly string[] = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("e-n-v")
    .description("Interactive environment setup utilities");

  program
    .command("setup")
    .description("Run the interactive prompt for an EnvModel")
    .argument("<model>", "Path to the module exporting an EnvModel instance")
    .argument("[config]", "Optional path to prompt configuration options")
    .action(async (modelPath: string, configPath?: string) => {
      try {
        await handleSetupCommand(modelPath, configPath);
      } catch (error) {
        if (error instanceof Error) {
          program.error(error.message);
          return;
        }

        program.error(String(error));
        return;
      }
    });

  program.showHelpAfterError();
  program.showSuggestionAfterError();

  await program.parseAsync(argv);
}
