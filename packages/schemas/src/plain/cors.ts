import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, custom } from "@e-n-v/core";
import { traits, descriptions } from "../shared/apiService";

export const corsOrigin = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.corsOrigin,
    process: string(
      custom(
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
        traits.corsOriginInvalid
      )
    ),
    ...input,
  });

export const CORS_ORIGIN = corsOrigin();

