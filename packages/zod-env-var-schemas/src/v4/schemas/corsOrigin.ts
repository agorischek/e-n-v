import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.CORS_ORIGIN)
  .refine(
    (val) => {
      if (val === "*") return true;
      const origins = val.split(",").map(origin => origin.trim());
      return origins.every(origin => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      });
    },
    { error: API_SERVICE_MESSAGES.CORS_ORIGIN_INVALID }
  );

export const corsOriginSchema = schema;
export const CORS_ORIGIN = corsOriginSchema;
