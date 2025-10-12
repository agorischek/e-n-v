import { z } from "zod";
import { defaults, descriptions, enumOptions } from "../../shared/apiService";

const schema = z
  .enum([...enumOptions.nodeEnv])
  .describe(descriptions.nodeEnv)
  .default(defaults.nodeEnv);

export const nodeEnvSchema = schema;
export const NODE_ENV = nodeEnvSchema;
