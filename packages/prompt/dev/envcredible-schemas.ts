import { prompt } from "../src";
import {
  apiKey,
  apiBaseUrl,
  apiTimeout,
  port,
  jwtSecret,
  jwtAccessTokenExpiresIn,
  jwtRefreshTokenExpiresIn,
  API_KEY,
  JWT_SECRET,
  PORT,
  API_TIMEOUT,
  API_BASE_URL,
} from "@e-n-v/schemas";

// Use the envcredible schemas which return native EnvVarSchema objects
// These schemas use Zod validation internally but return consistent interfaces

console.log("Testing envcredible schemas with input overrides...");

// Example 1: Use schemas with default settings
const basicSchemas = {
  API_KEY,
  API_BASE_URL,
  API_TIMEOUT,
  PORT,
  JWT_SECRET,
};

// Example 2: Override schema properties using the input parameter
const customizedSchemas = {
  API_KEY: apiKey({
    secret: true,
    required: true,
    description: "Your API key for authentication",
  }),
  API_BASE_URL: apiBaseUrl({
    required: false,
    default: "https://api.example.com",
    description: "Base URL for API requests (optional)",
  }),
  API_TIMEOUT: apiTimeout({
    default: 60,
    description: "Request timeout in seconds",
  }),
  PORT: port({
    default: 8080,
    description: "Application port number",
  }),
  JWT_SECRET: jwtSecret({
    description: "Secret key for JWT token signing",
  }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: jwtAccessTokenExpiresIn({
    default: "15m",
    description: "Access token expiration time",
  }),
  JWT_REFRESH_TOKEN_EXPIRES_IN: jwtRefreshTokenExpiresIn({
    default: "7d",
    description: "Refresh token expiration time",
  }),
};

console.log("\n=== Basic Schemas ===");
console.log("Using schemas with their default configurations...");
await prompt({
  schemas: basicSchemas,
  secrets: ["API_KEY", "JWT_SECRET"],
});

console.log("\n=== Customized Schemas ===");
console.log("Using schemas with custom overrides...");
await prompt({
  schemas: customizedSchemas,
  secrets: ["API_KEY", "JWT_SECRET"],
});
