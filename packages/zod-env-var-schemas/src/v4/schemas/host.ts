import { z } from "zod";
import { API_SERVICE_DEFAULTS, API_SERVICE_DESCRIPTIONS } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.HOST)
  .default(API_SERVICE_DEFAULTS.HOST);

export const hostSchema = schema;
export const HOST = hostSchema;
