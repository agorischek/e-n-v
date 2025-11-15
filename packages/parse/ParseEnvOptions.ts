import type { EnvModelOptions } from "@e-n-v/models";
import type { SupportedSchema } from "@e-n-v/models";

export type ParseEnvOptions<
  T extends Record<string, SupportedSchema> = Record<string, SupportedSchema>,
> = EnvModelOptions<T>;

/**
 * Options for the parse function (third parameter)
 */
export interface ParseOptions {
  /**
   * If true, sets all variables defined in the model to undefined in the source object before parsing.
   * Default: false
   */
  clear?: boolean;
}
