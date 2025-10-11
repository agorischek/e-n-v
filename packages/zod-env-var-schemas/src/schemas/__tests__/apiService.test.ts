import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import * as defaultSchemas from "../apiService";
import * as v4Schemas from "../../v4/schemas/apiService";
import * as v3Schemas from "../../v3/schemas/apiService";

const expectZodMessage = (fn: () => unknown, message: string) => {
  try {
    fn();
    throw new Error("expected schema to reject value");
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
    if (error instanceof ZodError) {
      expect(error.issues[0]?.message).toBe(message);
    }
  }
};

const suites = [
  ["default (v4)", defaultSchemas],
  ["v4", v4Schemas],
  ["v3", v3Schemas],
] as const;

for (const [label, schemaSet] of suites) {
  const {
    API_BASE_URL,
    API_KEY,
    API_TIMEOUT,
    CORS_ORIGIN,
    ENCRYPTION_KEY,
    HOST,
    JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN,
    JWT_SECRET,
    LOG_LEVEL,
    MAX_FILE_SIZE,
    NODE_ENV,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REDIRECT_URI,
    OAUTH_SCOPE,
    PORT,
    RATE_LIMIT_RPM,
    RATE_LIMIT_WINDOW,
    SERVICE_URL,
    SESSION_SECRET,
    WEBHOOK_URL,
  } = schemaSet;

  describe(`apiService schemas (${label})`, () => {
  test("API_KEY enforces minimum length", () => {
  expect(API_KEY.parse("abcdefgh")).toBe("abcdefgh");
    expectZodMessage(() => API_KEY.parse("short"), "API key must be at least 8 characters long");
  });

  test("JWT_SECRET requires strong length", () => {
    expect(JWT_SECRET.parse("x".repeat(32))).toBe("x".repeat(32));
    expectZodMessage(
      () => JWT_SECRET.parse("weak"),
      "JWT secret must be at least 32 characters long for security",
    );
  });

  test("JWT token expirations accept friendly defaults", () => {
    expect(JWT_ACCESS_TOKEN_EXPIRES_IN.parse("30m")).toBe("30m");
    expect(JWT_ACCESS_TOKEN_EXPIRES_IN.parse(undefined)).toBe("15m");
    expectZodMessage(
      () => JWT_ACCESS_TOKEN_EXPIRES_IN.parse("30"),
      "Must be in format like '15m', '1h', '7d'",
    );

    expect(JWT_REFRESH_TOKEN_EXPIRES_IN.parse("14d")).toBe("14d");
    expect(JWT_REFRESH_TOKEN_EXPIRES_IN.parse(undefined)).toBe("7d");
    expectZodMessage(
      () => JWT_REFRESH_TOKEN_EXPIRES_IN.parse("invalid"),
      "Must be in format like '15m', '1h', '7d'",
    );
  });

  test("API_BASE_URL and SERVICE_URL require valid URLs", () => {
    const url = "https://service.example";
    expect(API_BASE_URL.parse(url)).toBe(url);
    expectZodMessage(
      () => API_BASE_URL.parse("ftp://example.com"),
      "Must start with http:// or https://",
    );

    expect(SERVICE_URL.parse(url)).toBe(url);
    expectZodMessage(() => SERVICE_URL.parse("not-a-url"), "Must be a valid URL");
  });

  test("WEBHOOK_URL requires HTTPS", () => {
    const webhook = "https://hooks.example/app";
    expect(WEBHOOK_URL.parse(webhook)).toBe(webhook);
    expectZodMessage(
      () => WEBHOOK_URL.parse("http://hooks.example/app"),
      "Webhook URLs should use HTTPS for security",
    );
  });

  test("OAuth secrets enforce presence", () => {
  expect(OAUTH_CLIENT_ID.parse("client")).toBe("client");
    expectZodMessage(() => OAUTH_CLIENT_ID.parse(""), "OAuth client ID is required");

    expect(OAUTH_CLIENT_SECRET.parse("a".repeat(12))).toBe("a".repeat(12));
    expectZodMessage(
      () => OAUTH_CLIENT_SECRET.parse("short"),
      "OAuth client secret must be at least 8 characters long",
    );

    const redirect = "https://app.example/callback";
    expect(OAUTH_REDIRECT_URI.parse(redirect)).toBe(redirect);
    expectZodMessage(() => OAUTH_REDIRECT_URI.parse("not-a-url"), "Must be a valid URL");

  expect(OAUTH_SCOPE.parse("openid profile")).toBe("openid profile");
    expectZodMessage(() => OAUTH_SCOPE.parse(""), "OAuth scope is required");
  });

  test("Secrets require minimum strength", () => {
    const secret = "s".repeat(64);
    expect(ENCRYPTION_KEY.parse(secret)).toBe(secret);
    expectZodMessage(
      () => ENCRYPTION_KEY.parse("short"),
      "Encryption key must be at least 32 characters long",
    );

    expect(SESSION_SECRET.parse(secret)).toBe(secret);
    expectZodMessage(
      () => SESSION_SECRET.parse("short"),
      "Session secret must be at least 32 characters long for security",
    );
  });

  test("CORS origin validation accepts wildcard or full URLs", () => {
  expect(CORS_ORIGIN.parse("*")).toBe("*");
    const multiOrigin = "https://a.example, https://b.example";
    expect(CORS_ORIGIN.parse(multiOrigin)).toBe(multiOrigin);
    expectZodMessage(
      () => CORS_ORIGIN.parse("https://ok.example,not-a-url"),
      "Must be '*' or comma-separated valid URLs",
    );
  });

  test("Numeric tunables enforce bounds and defaults", () => {
  expect(RATE_LIMIT_RPM.parse(120)).toBe(120);
    expect(RATE_LIMIT_RPM.parse(undefined)).toBe(60);
    expectZodMessage(
      () => RATE_LIMIT_RPM.parse(0),
      "Rate limit must be at least 1",
    );

  expect(RATE_LIMIT_WINDOW.parse(5)).toBe(5);
    expect(RATE_LIMIT_WINDOW.parse(undefined)).toBe(1);
    expectZodMessage(
      () => RATE_LIMIT_WINDOW.parse(0),
      "Rate limit window must be at least 1 minute",
    );

  expect(API_TIMEOUT.parse(5000)).toBe(5000);
    expect(API_TIMEOUT.parse(undefined)).toBe(30000);
    expectZodMessage(
      () => API_TIMEOUT.parse(999),
      "Timeout must be at least 1 second",
    );

  expect(MAX_FILE_SIZE.parse(4096)).toBe(4096);
    expect(MAX_FILE_SIZE.parse(undefined)).toBe(10485760);
    expectZodMessage(
      () => MAX_FILE_SIZE.parse(512),
      "File size must be at least 1KB",
    );

  expect(PORT.parse(4000)).toBe(4000);
    expect(PORT.parse(undefined)).toBe(3000);
    expectZodMessage(() => PORT.parse(80), "Port must be >= 1024 (avoid reserved ports)");
  });

  test("Enums restrict inputs and provide defaults", () => {
  expect(LOG_LEVEL.parse("debug")).toBe("debug");
    expect(LOG_LEVEL.parse(undefined)).toBe("info");
    expect(() => LOG_LEVEL.parse("verbose")).toThrow(ZodError);

  expect(NODE_ENV.parse("production")).toBe("production");
    expect(NODE_ENV.parse(undefined)).toBe("development");
    expect(() => NODE_ENV.parse("local")).toThrow(ZodError);
  });

  test("HOST accepts custom values and defaults to localhost", () => {
  expect(HOST.parse("0.0.0.0")).toBe("0.0.0.0");
    expect(HOST.parse(undefined)).toBe("localhost");
  });
  });
}
