import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { descriptions, messages } from "../shared/apiService";

export const corsOrigin = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.corsOrigin,
    process: processWithZodSchema<string>(
      z.string().refine(
        (val) => {
          if (val === "*") return true;
          const origins = val.split(",").map((origin) => origin.trim());
          return origins.every((origin) => {
            try {
              new URL(origin);
              return true;
            } catch {
              return false;
            }
          });
        },
        { message: messages.corsOriginInvalid },
      ),
      "string"
    ),
    ...input,
  });

export const CORS_ORIGIN = corsOrigin();

export const cors = {
  CORS_ORIGIN,
} as const;