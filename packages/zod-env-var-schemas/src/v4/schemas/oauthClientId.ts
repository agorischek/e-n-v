import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_CLIENT_ID)
  .min(1, { error: API_SERVICE_MESSAGES.OAUTH_CLIENT_ID_REQUIRED });

export const oauthClientIdSchema = schema;
export const OAUTH_CLIENT_ID = oauthClientIdSchema;
