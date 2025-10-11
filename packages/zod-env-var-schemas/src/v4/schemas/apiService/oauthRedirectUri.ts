import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_REDIRECT_URI)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL });

export const oauthRedirectUriSchema = schema;
export const OAUTH_REDIRECT_URI = oauthRedirectUriSchema;
