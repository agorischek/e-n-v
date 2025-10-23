import { z } from "zod";
import { descriptions, messages } from "../../shared/apiService";

export const cors = () =>
  z
    .string()
    .describe(descriptions.corsOrigin)
    .refine(
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
      { error: messages.corsOriginInvalid },
    );

export const CORS_ORIGIN = cors();
