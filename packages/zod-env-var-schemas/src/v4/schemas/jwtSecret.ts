import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_LENGTHS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.JWT_SECRET)
  .min(API_SERVICE_LENGTHS.JWT_SECRET_MIN, { error: API_SERVICE_MESSAGES.JWT_SECRET_MIN });

export const jwtSecretSchema = schema;
export const JWT_SECRET = jwtSecretSchema;
