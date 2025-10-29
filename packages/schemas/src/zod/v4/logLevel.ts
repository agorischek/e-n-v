import { defaults, descriptions, enumOptions } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const logLevelSchema = (z: ZodSingleton) => z
  .enum([...enumOptions.logLevel])
  .describe(descriptions.logLevel)
  .default(defaults.logLevel);
