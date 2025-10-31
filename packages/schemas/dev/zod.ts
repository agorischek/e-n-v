import { z } from "zod";
import schemas from "../src/zod/v4";

const { NODE_ENV } = schemas(z);

console.log("Current NODE_ENV:", NODE_ENV.parse(process.env.NODE_ENV));

// console.log("🔧 Testing Zod v4 schemas...\n");

// // Create all schemas with zod instance
// const schemas = createSchemas(z);

// // Test some common environment variables
// const testEnvVars = {
//   NODE_ENV: "development",
//   API_KEY: "sk-test123456789abcdef",
//   API_BASE_URL: "https://api.example.com",
//   API_TIMEOUT: "30000",
//   DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
//   DATABASE_PORT: "5432",
//   JWT_SECRET: "super-secret-jwt-key-min-32-chars",
//   REDIS_HOST: "localhost",
//   REDIS_PORT: "6379",
//   PORT: "3000",
//   LOG_LEVEL: "info",
// };

// console.log("📊 Testing schema validations:\n");

// // Test each schema with sample data
// Object.entries(testEnvVars).forEach(([key, value]) => {
//   const schema = schemas[key as keyof typeof schemas];

//   if (schema) {
//     try {
//       const result = schema.parse(value);
//       console.log(`✅ ${key}: ${JSON.stringify(result)}`);
//     } catch (error) {
//       console.log(`❌ ${key}: ${error instanceof Error ? error.message : 'Validation failed'}`);
//     }
//   } else {
//     console.log(`⚠️  ${key}: Schema not found`);
//   }
// });

// console.log("\n🧪 Testing schema properties:\n");

// // Test schema descriptions and defaults
// const schemaTests = [
//   { name: "NODE_ENV", schema: schemas.NODE_ENV },
//   { name: "API_TIMEOUT", schema: schemas.API_TIMEOUT },
//   { name: "DATABASE_PORT", schema: schemas.DATABASE_PORT },
//   { name: "JWT_SECRET", schema: schemas.JWT_SECRET },
// ];

// schemaTests.forEach(({ name, schema }) => {
//   console.log(`📋 ${name}:`);
//   console.log(`   Description: ${schema.description || 'No description'}`);

//   // Try to get default value
//   try {
//     const defaultResult = schema.parse(undefined);
//     console.log(`   Default: ${JSON.stringify(defaultResult)}`);
//   } catch {
//     console.log(`   Default: None`);
//   }

//   // Show schema type
//   console.log(`   Type: ${(schema._def as any).typeName || 'Unknown'}`);
//   console.log();
// });

// console.log("🔍 Testing error cases:\n");

// // Test validation errors
// const errorTests = [
//   { schema: schemas.API_KEY, value: "", expected: "Too short" },
//   { schema: schemas.API_BASE_URL, value: "not-a-url", expected: "Invalid URL" },
//   { schema: schemas.DATABASE_PORT, value: "999999", expected: "Out of range" },
//   { schema: schemas.JWT_SECRET, value: "short", expected: "Too short" },
// ];

// errorTests.forEach(({ schema, value, expected }) => {
//   const result = schema.safeParse(value);
//   if (!result.success) {
//     console.log(`❌ Expected error (${expected}): ${(result.error as any).errors?.[0]?.message || 'Validation error'}`);
//   } else {
//     console.log(`⚠️  Expected error but validation passed: ${JSON.stringify(result.data)}`);
//   }
// });

// console.log("\n📈 Schema statistics:\n");

// // Count schemas by category
// const schemaKeys = Object.keys(schemas);
// const categories = {
//   API: schemaKeys.filter(key => key.startsWith('API_')),
//   DATABASE: schemaKeys.filter(key => key.startsWith('DATABASE_')),
//   AWS: schemaKeys.filter(key => key.startsWith('AWS_')),
//   AZURE: schemaKeys.filter(key => key.startsWith('AZURE_')),
//   REDIS: schemaKeys.filter(key => key.startsWith('REDIS_')),
//   JWT: schemaKeys.filter(key => key.startsWith('JWT_')),
//   OAUTH: schemaKeys.filter(key => key.startsWith('OAUTH_')),
//   OPENAI: schemaKeys.filter(key => key.startsWith('OPENAI_')),
//   OTHER: schemaKeys.filter(key => !['API_', 'DATABASE_', 'AWS_', 'AZURE_', 'REDIS_', 'JWT_', 'OAUTH_', 'OPENAI_'].some(prefix => key.startsWith(prefix))),
// };

// Object.entries(categories).forEach(([category, keys]) => {
//   if (keys.length > 0) {
//     console.log(`${category}: ${keys.length} schemas`);
//     keys.forEach(key => console.log(`  - ${key}`));
//     console.log();
//   }
// });

// console.log(`🎯 Total schemas: ${schemaKeys.length}`);

// console.log("\n✨ Zod v4 schema testing complete!");

// export {};
