import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_LENGTHS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_CLIENT_SECRET)
  .min(API_SERVICE_LENGTHS.OAUTH_CLIENT_SECRET_MIN, { error: API_SERVICE_MESSAGES.OAUTH_CLIENT_SECRET_MIN });

export const oauthClientSecretSchema = schema;
export const OAUTH_CLIENT_SECRET = oauthClientSecretSchema;
