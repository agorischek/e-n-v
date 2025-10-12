import { API_KEY } from "./apiKey";
import { JWT_SECRET } from "./jwtSecret";
import { JWT_ACCESS_TOKEN_EXPIRES_IN } from "./jwtAccessTokenExpiresIn";
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from "./jwtRefreshTokenExpiresIn";
import { API_BASE_URL } from "./apiBaseUrl";
import { SERVICE_URL } from "./serviceUrl";
import { WEBHOOK_URL } from "./webhookUrl";
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI, OAUTH_SCOPE } from "./oauth";
import { ENCRYPTION_KEY } from "./encryptionKey";
import { SESSION_SECRET } from "./sessionSecret";
import { CORS_ORIGIN } from "./corsOrigin";
import { RATE_LIMIT_RPM } from "./rateLimitRpm";
import { RATE_LIMIT_WINDOW } from "./rateLimitWindow";
import { API_TIMEOUT } from "./apiTimeout";
import { MAX_FILE_SIZE } from "./maxFileSize";
import { LOG_LEVEL } from "./logLevel";
import { NODE_ENV } from "./nodeEnv";
import { PORT } from "./port";
import { HOST } from "./host";

export { apiKeySchema, apiKey, API_KEY } from "./apiKey";
export { jwtSecretSchema, JWT_SECRET } from "./jwtSecret";
export { jwtAccessTokenExpiresInSchema, JWT_ACCESS_TOKEN_EXPIRES_IN } from "./jwtAccessTokenExpiresIn";
export { jwtRefreshTokenExpiresInSchema, JWT_REFRESH_TOKEN_EXPIRES_IN } from "./jwtRefreshTokenExpiresIn";
export { apiBaseUrlSchema, apiBaseUrl, API_BASE_URL } from "./apiBaseUrl";
export { serviceUrl, serviceUrlSchema, SERVICE_URL } from "./serviceUrl";
export { webhookUrl, WEBHOOK_URL } from "./webhookUrl";
export {
  oauthClientId,
  oauthClientSecret,
  oauthRedirectUri,
  oauthScope,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
  oauthSchemas,
} from "./oauth";
export { encryptionKey, ENCRYPTION_KEY } from "./encryptionKey";
export { sessionSecretSchema, SESSION_SECRET } from "./sessionSecret";
export { corsOriginSchema, CORS_ORIGIN } from "./corsOrigin";
export { rateLimitRpmSchema, RATE_LIMIT_RPM } from "./rateLimitRpm";
export { rateLimitWindowSchema, RATE_LIMIT_WINDOW } from "./rateLimitWindow";
export { apiTimeoutSchema, API_TIMEOUT } from "./apiTimeout";
export { maxFileSizeSchema, MAX_FILE_SIZE } from "./maxFileSize";
export { logLevelSchema, LOG_LEVEL } from "./logLevel";
export { nodeEnvSchema, NODE_ENV } from "./nodeEnv";
export { portSchema, PORT } from "./port";
export { hostSchema, HOST } from "./host";

export const apiServiceSchemas = {
  API_KEY,
  JWT_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  API_BASE_URL,
  SERVICE_URL,
  WEBHOOK_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
  ENCRYPTION_KEY,
  SESSION_SECRET,
  CORS_ORIGIN,
  RATE_LIMIT_RPM,
  RATE_LIMIT_WINDOW,
  API_TIMEOUT,
  MAX_FILE_SIZE,
  LOG_LEVEL,
  NODE_ENV,
  PORT,
  HOST,
} as const;
