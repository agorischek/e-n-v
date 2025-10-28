import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { descriptions, messages } from "../shared/apiService";

export const corsOrigin = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.corsOrigin,
    process: createZodProcessor(
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
    ),
    ...input,
  });

export const CORS_ORIGIN = corsOrigin();

export const cors = {
  CORS_ORIGIN,
} as const;
