import { z } from "zod";
import { descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.apiKey)
  .min(constraints.apiKeyMinLength, { error: messages.apiKeyMin });

export const apiKey = () => schema;
export const apiKeySchema = schema;
export const API_KEY = schema;
