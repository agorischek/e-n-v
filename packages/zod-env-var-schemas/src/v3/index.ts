export * from "./schemas";

import { apiServiceSchemas } from "./schemas/apiService";
import { applicationInsightsSchemas } from "./schemas/applicationInsights";
import { databaseSchemas } from "./schemas/database";
import { infrastructureSchemas } from "./schemas/infrastructure";
import { oauthSchemas } from "./schemas/oauth";

export { apiServiceSchemas } from "./schemas/apiService";
export { applicationInsightsSchemas } from "./schemas/applicationInsights";
export { databaseSchemas } from "./schemas/database";
export { infrastructureSchemas } from "./schemas/infrastructure";
export { oauthSchemas } from "./schemas/oauth";

export const schemas = {
  applicationInsights: applicationInsightsSchemas,
  database: databaseSchemas,
  apiService: apiServiceSchemas,
  infrastructure: infrastructureSchemas,
  oauth: oauthSchemas,
} as const;

export const allSchemas = {
  ...applicationInsightsSchemas,
  ...databaseSchemas,
  ...apiServiceSchemas,
  ...infrastructureSchemas,
  ...oauthSchemas,
} as const;
