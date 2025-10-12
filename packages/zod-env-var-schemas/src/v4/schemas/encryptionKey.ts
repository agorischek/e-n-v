import { z } from "zod";
import { descriptions, constraints, messages } from "../../shared/apiService";

const encryptionKeySchema = z
  .string()
  .describe(descriptions.encryptionKey)
  .min(constraints.encryptionKeyMinLength, { error: messages.encryptionKeyMin });

export const encryptionKey = () => encryptionKeySchema;
export const ENCRYPTION_KEY = encryptionKeySchema;
