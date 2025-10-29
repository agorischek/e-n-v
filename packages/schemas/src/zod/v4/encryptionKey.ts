import { descriptions, constraints, messages } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const encryptionKey = (z: ZodSingleton) => z
  .string()
  .describe(descriptions.encryptionKey)
  .min(constraints.encryptionKeyMinLength, {
    error: messages.encryptionKeyMin,
  });
