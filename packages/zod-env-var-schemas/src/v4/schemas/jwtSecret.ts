import { z } from "zod";
import { descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.jwtSecret)
  .min(constraints.jwtSecretMinLength, { error: messages.jwtSecretMin });

export const jwtSecretSchema = schema;
export const JWT_SECRET = jwtSecretSchema;
