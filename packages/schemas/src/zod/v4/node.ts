import { defaults, descriptions, enumOptions } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const nodeEnv = (z: ZodSingleton) =>
  z
    .enum([...enumOptions.nodeEnv])
    .describe(descriptions.nodeEnv)
    .default(defaults.nodeEnv);
