import type { EnvModelOptions } from "@e-n-v/models";
import type { SupportedSchema } from "@e-n-v/models";

export type ParseEnvOptions<T extends Record<string, SupportedSchema> = Record<string, SupportedSchema>> = EnvModelOptions<T>;