import type { EnvModelOptions } from "@e-n-v/models";
import type { PromptEnvInteractiveOptions } from "./PromptEnvInteractiveOptions";

/**
 * Configuration options for the prompt function
 */
export type PromptEnvOptions = EnvModelOptions & PromptEnvInteractiveOptions;