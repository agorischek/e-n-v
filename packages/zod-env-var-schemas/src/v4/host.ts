import { z } from "zod";
import { defaults, descriptions } from "../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.host)
  .default(defaults.host);

export const hostSchema = schema;
export const HOST = hostSchema;
