import { z } from "zod";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

export const nodeEnv = () =>
  z
    .enum([...enumOptions.nodeEnv])
    .describe(descriptions.nodeEnv)
    .default(defaults.nodeEnv);

export const NODE_ENV = nodeEnv();