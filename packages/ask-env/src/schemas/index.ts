/**
 * Pre-built Zod schemas for common environment variables
 * 
 * This module provides validated schemas for typical environment variables
 * used in modern applications, including database connections, API services,
 * cloud infrastructure, and monitoring tools.
 * 
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { askEnv } from "ask-env";
 * import { 
 *   APPLICATIONINSIGHTS_CONNECTION_STRING,
 *   DATABASE_URL_POSTGRESQL,
 *   JWT_SECRET,
 *   PORT 
 * } from "ask-env/schemas";
 * 
 * await askEnv({
 *   APPLICATIONINSIGHTS_CONNECTION_STRING,
 *   DATABASE_URL: DATABASE_URL_POSTGRESQL,
 *   JWT_SECRET,
 *   PORT,
 * });
 * ```
 */

// Export individual schemas
export * from "./applicationInsights";
export * from "./database";
export * from "./apiService";
export * from "./infrastructure";

// Export grouped schemas for convenience
export { applicationInsightsSchemas } from "./applicationInsights";
export { databaseSchemas } from "./database";
export { apiServiceSchemas } from "./apiService";
export { infrastructureSchemas } from "./infrastructure";

// Create a combined schemas object for easy access
import { applicationInsightsSchemas } from "./applicationInsights";
import { databaseSchemas } from "./database";
import { apiServiceSchemas } from "./apiService";
import { infrastructureSchemas } from "./infrastructure";

/**
 * All available schemas grouped by category
 */
export const schemas = {
  applicationInsights: applicationInsightsSchemas,
  database: databaseSchemas,
  apiService: apiServiceSchemas,
  infrastructure: infrastructureSchemas,
} as const;

/**
 * All schemas flattened into a single object for convenience
 */
export const allSchemas = {
  ...applicationInsightsSchemas,
  ...databaseSchemas,
  ...apiServiceSchemas,
  ...infrastructureSchemas,
} as const;