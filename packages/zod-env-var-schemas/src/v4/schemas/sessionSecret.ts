import { z } from "zod";
import { descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.sessionSecret)
  .min(constraints.sessionSecretMinLength, { error: messages.sessionSecretMin });

export const sessionSecretSchema = schema;
export const SESSION_SECRET = sessionSecretSchema;
