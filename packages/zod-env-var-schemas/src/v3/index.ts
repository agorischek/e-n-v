export * from "./schemas";

import { apiServiceSchemas } from "./schemas/apiService";
import { applicationInsights } from "./schemas/applicationInsights";
import { databaseSchemas } from "./schemas/database";
import { infrastructureSchemas } from "./schemas/infrastructure";
import { oauth } from "./schemas/oauth";

export { apiServiceSchemas } from "./schemas/apiService";
export { applicationInsights } from "./schemas/applicationInsights";
export { databaseSchemas } from "./schemas/database";
export { infrastructureSchemas } from "./schemas/infrastructure";
export { oauth } from "./schemas/oauth";

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
