import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_SCOPE)
  .min(1, { error: API_SERVICE_MESSAGES.OAUTH_SCOPE_REQUIRED });

export const oauthScopeSchema = schema;
export const OAUTH_SCOPE = oauthScopeSchema;
