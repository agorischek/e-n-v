import {
  StringEnvVarSchema,
  type StringEnvVarSchemaInput,
} from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { defaults, descriptions } from "../shared/apiService";

export const host = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.host,
    default: defaults.host,
    process: createZodProcessor(z.string()),
    ...input,
  });

export const HOST = host();

export const hostSchema = {
  HOST,
} as const;
