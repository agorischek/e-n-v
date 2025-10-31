#!/usr/bin/env bun

/**
 * Interactive validator testing script
 * Tests the custom validator system with various inputs to see error message composition
 */

import { apiKey, apiBaseUrl, apiTimeout } from "../src/plain/api";
import { databaseUrl, databasePoolSize } from "../src/plain/database";
import { port } from "../src/plain/common";
import { nodeEnv } from "../src/plain/node";
import { awsRegion, awsS3BucketName, awsAccessKeyId } from "../src/plain/aws";
import { redisUrl, redisPort, redisDb } from "../src/plain/redis";
import { jwtSecret, jwtAccessTokenExpiresIn } from "../src/plain/jwt";
import {
  openaiApiKey,
  openaiTimeout,
  openaiBaseUrl,
} from "../src/plain/openai";
import { corsOrigin } from "../src/plain/cors";

console.log("🧪 Testing Custom Validators - Interactive Mode\n");
console.log("=".repeat(60));

// Test helper function
function testValidator(
  name: string,
  schema: any,
  testCases: Array<{
    input: string;
    expected: "valid" | "error";
    description: string;
  }>,
) {
  console.log(`\n📋 Testing: ${name}`);
  console.log("-".repeat(60));

  for (const testCase of testCases) {
    try {
      const result = schema.process(testCase.input);
      if (testCase.expected === "valid") {
        console.log(`✅ ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Result: ${JSON.stringify(result)}`);
      } else {
        console.log(`❌ UNEXPECTED PASS: ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Result: ${JSON.stringify(result)} (expected error)`);
      }
    } catch (error) {
      if (testCase.expected === "error") {
        console.log(`✅ ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Error: "${(error as Error).message}"`);
      } else {
        console.log(`❌ UNEXPECTED ERROR: ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Error: "${(error as Error).message}"`);
      }
    }
  }
}

// API Key Tests
testValidator("API_KEY", apiKey(), [
  { input: "short", expected: "error", description: "Too short (< 8 chars)" },
  {
    input: "valid-api-key-123",
    expected: "valid",
    description: "Valid API key",
  },
  {
    input: "",
    expected: "valid",
    description: "Empty string returns undefined",
  },
]);

// API Base URL Tests
testValidator("API_BASE_URL", apiBaseUrl(), [
  { input: "not-a-url", expected: "error", description: "Invalid URL format" },
  {
    input: "ftp://example.com",
    expected: "error",
    description: "Wrong protocol (not http/https)",
  },
  {
    input: "http://api.example.com",
    expected: "valid",
    description: "Valid HTTP URL",
  },
  {
    input: "https://api.example.com",
    expected: "valid",
    description: "Valid HTTPS URL",
  },
]);

// API Timeout Tests
testValidator("API_TIMEOUT", apiTimeout(), [
  { input: "not-a-number", expected: "error", description: "Not a number" },
  { input: "500", expected: "error", description: "Below minimum (< 1000)" },
  { input: "30000", expected: "valid", description: "Valid timeout" },
  {
    input: "500000",
    expected: "error",
    description: "Above maximum (> 300000)",
  },
  { input: "1500.5", expected: "error", description: "Not an integer" },
]);

// Database URL Tests
testValidator("DATABASE_URL", databaseUrl(), [
  {
    input: "invalid-url",
    expected: "error",
    description: "Invalid database URL",
  },
  {
    input: "postgresql://user:pass@localhost/db",
    expected: "valid",
    description: "Valid PostgreSQL URL",
  },
  {
    input: "mysql://localhost:3306/mydb",
    expected: "valid",
    description: "Valid MySQL URL",
  },
  {
    input: "mongodb://localhost:27017/db",
    expected: "valid",
    description: "Valid MongoDB URL",
  },
]);

// Port Tests
testValidator("PORT", port(), [
  { input: "80", expected: "error", description: "Reserved port (< 1024)" },
  { input: "3000", expected: "valid", description: "Valid port" },
  { input: "99999", expected: "error", description: "Port too high (> 65535)" },
  { input: "abc", expected: "error", description: "Not a number" },
]);

// Node Environment Tests
testValidator("NODE_ENV", nodeEnv(), [
  {
    input: "development",
    expected: "valid",
    description: "Valid: development",
  },
  { input: "production", expected: "valid", description: "Valid: production" },
  { input: "test", expected: "valid", description: "Valid: test" },
  { input: "invalid", expected: "error", description: "Invalid environment" },
]);

// AWS Region Tests
testValidator("AWS_REGION", awsRegion(), [
  { input: "us-east-1", expected: "valid", description: "Valid AWS region" },
  { input: "eu-west-2", expected: "valid", description: "Valid EU region" },
  {
    input: "invalid-region",
    expected: "error",
    description: "Invalid region format",
  },
]);

// AWS S3 Bucket Name Tests
testValidator("AWS_S3_BUCKET_NAME", awsS3BucketName(), [
  { input: "my-bucket", expected: "valid", description: "Valid bucket name" },
  {
    input: "MyBucket",
    expected: "error",
    description: "Contains uppercase (invalid)",
  },
  { input: "ab", expected: "error", description: "Too short (< 3 chars)" },
]);

// Redis URL Tests
testValidator("REDIS_URL", redisUrl(), [
  {
    input: "redis://localhost:6379",
    expected: "valid",
    description: "Valid Redis URL",
  },
  {
    input: "rediss://secure.redis.com:6380",
    expected: "valid",
    description: "Valid Redis SSL URL",
  },
  {
    input: "http://localhost:6379",
    expected: "error",
    description: "Wrong protocol",
  },
]);

// Redis Port Tests
testValidator("REDIS_PORT", redisPort(), [
  { input: "6379", expected: "valid", description: "Valid Redis port" },
  { input: "0", expected: "error", description: "Port too low" },
  { input: "70000", expected: "error", description: "Port too high" },
]);

// Redis DB Tests
testValidator("REDIS_DB", redisDb(), [
  { input: "0", expected: "valid", description: "Valid DB index 0" },
  { input: "15", expected: "valid", description: "Valid DB index 15" },
  { input: "16", expected: "error", description: "DB index too high (> 15)" },
  { input: "-1", expected: "error", description: "Negative DB index" },
]);

// JWT Secret Tests
testValidator("JWT_SECRET", jwtSecret(), [
  { input: "short", expected: "error", description: "Too short (< 32 chars)" },
  {
    input: "this-is-a-very-long-secret-key-for-jwt-tokens-123",
    expected: "valid",
    description: "Valid long secret",
  },
]);

// JWT Token Duration Tests
testValidator("JWT_ACCESS_TOKEN_EXPIRES_IN", jwtAccessTokenExpiresIn(), [
  { input: "15m", expected: "valid", description: "Valid: 15 minutes" },
  { input: "1h", expected: "valid", description: "Valid: 1 hour" },
  { input: "7d", expected: "valid", description: "Valid: 7 days" },
  { input: "invalid", expected: "error", description: "Invalid format" },
  { input: "15", expected: "error", description: "Missing unit" },
]);

// OpenAI API Key Tests
testValidator("OPENAI_API_KEY", openaiApiKey(), [
  {
    input: "sk-short",
    expected: "error",
    description: "Too short (< 40 chars)",
  },
  {
    input: "sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890",
    expected: "valid",
    description: "Valid OpenAI key format",
  },
  {
    input: "not-starting-with-sk",
    expected: "error",
    description: "Wrong prefix",
  },
]);

// OpenAI Timeout Tests (different from API timeout)
testValidator("OPENAI_TIMEOUT", openaiTimeout(), [
  { input: "0", expected: "error", description: "Below minimum (< 1)" },
  { input: "30", expected: "valid", description: "Valid timeout (30s)" },
  { input: "700", expected: "error", description: "Above maximum (> 600)" },
]);

// OpenAI Base URL Tests
testValidator("OPENAI_BASE_URL", openaiBaseUrl(), [
  {
    input: "http://localhost:8080",
    expected: "error",
    description: "HTTP not allowed (needs HTTPS)",
  },
  {
    input: "https://api.openai.com",
    expected: "valid",
    description: "Valid HTTPS URL",
  },
  { input: "not-a-url", expected: "error", description: "Invalid URL format" },
]);

// CORS Origin Tests (custom validation)
testValidator("CORS_ORIGIN", corsOrigin(), [
  { input: "*", expected: "valid", description: "Wildcard allowed" },
  {
    input: "https://example.com",
    expected: "valid",
    description: "Single valid URL",
  },
  {
    input: "https://app.com,https://web.com",
    expected: "valid",
    description: "Multiple valid URLs",
  },
  { input: "not-a-url", expected: "error", description: "Invalid URL in list" },
]);

// Multiple validation errors test
console.log("\n\n" + "=".repeat(60));
console.log("🔥 Testing Multiple Validation Errors (Error Aggregation)");
console.log("=".repeat(60));

testValidator("AWS_ACCESS_KEY_ID (multiple validators)", awsAccessKeyId(), [
  {
    input: "short",
    expected: "error",
    description: "Too short - should show lengthBetween error",
  },
  {
    input: "x".repeat(150),
    expected: "error",
    description: "Too long - should show lengthBetween error",
  },
  {
    input: "VALID_KEY_ID_12345678",
    expected: "valid",
    description: "Valid length",
  },
]);

testValidator("DATABASE_POOL_SIZE (integer + range)", databasePoolSize(), [
  { input: "10.5", expected: "error", description: "Not an integer" },
  { input: "0", expected: "error", description: "Below minimum (< 1)" },
  { input: "150", expected: "error", description: "Above maximum (> 100)" },
  { input: "50", expected: "valid", description: "Valid pool size" },
]);

console.log("\n" + "=".repeat(60));
console.log("✨ Testing Complete!");
console.log("=".repeat(60));
console.log("\n💡 Tip: Check how error messages compose with 'must be' prefix");
console.log("💡 Tip: Multiple validators should join errors with 'and'");
console.log("💡 Tip: Empty strings return undefined per Processor contract\n");
