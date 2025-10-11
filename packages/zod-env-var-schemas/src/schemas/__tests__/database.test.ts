import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import * as defaultSchemas from "../database";
import * as v4Schemas from "../../v4/schemas/database";
import * as v3Schemas from "../../v3/schemas/database";

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
    DATABASE_HOST,
    DATABASE_NAME,
    DATABASE_PASSWORD,
    DATABASE_POOL_SIZE,
    DATABASE_PORT,
    DATABASE_SCHEMA,
    DATABASE_TIMEOUT,
    DATABASE_URL,
    DATABASE_URL_MONGODB,
    DATABASE_URL_MYSQL,
    DATABASE_URL_POSTGRESQL,
    DATABASE_URL_SQLSERVER,
    DATABASE_USERNAME,
    REDIS_URL,
    DATABASE_SSL,
  } = schemaSet;

  describe(`database schemas (${label})`, () => {
    test("connection string variants validate formats", () => {
      const postgres = "postgresql://user:pass@localhost:5432/app";
      expect(DATABASE_URL_POSTGRESQL.parse(postgres)).toBe(postgres);
      expectZodMessage(
        () => DATABASE_URL_POSTGRESQL.parse("http://localhost"),
        "Must be a valid PostgreSQL connection string (postgresql://...)",
      );

      const mysql = "mysql://user@host:3306/db";
      expect(DATABASE_URL_MYSQL.parse(mysql)).toBe(mysql);
      expectZodMessage(
        () => DATABASE_URL_MYSQL.parse("postgresql://host/db"),
        "Must be a valid MySQL connection string (mysql://...)",
      );

      const mongo = "mongodb://user:pass@cluster0.mongo:27017/app";
      expect(DATABASE_URL_MONGODB.parse(mongo)).toBe(mongo);
      expectZodMessage(
        () => DATABASE_URL_MONGODB.parse("sqlite:///tmp/app.db"),
        "Must be a valid MongoDB connection string (mongodb:// or mongodb+srv://...)",
      );

      const sqlserver = "sqlserver://user:pass@dbserver:1433/database";
      expect(DATABASE_URL_SQLSERVER.parse(sqlserver)).toBe(sqlserver);
      expectZodMessage(
        () => DATABASE_URL_SQLSERVER.parse("Server=missing;"),
        "Must be a valid SQL Server connection string (sqlserver://... or Server=...;Database=...;...)",
      );

      const redis = "redis://user:pass@cache.example:6379/0";
      expect(REDIS_URL.parse(redis)).toBe(redis);
      expectZodMessage(
        () => REDIS_URL.parse("http://cache"),
        "Must be a valid Redis connection string (redis:// or rediss://...)",
      );

      const generic = "mysql://user:pass@host/db";
      expect(DATABASE_URL.parse(generic)).toBe(generic);
      expectZodMessage(
        () => DATABASE_URL.parse("ftp://example.com"),
        "Must be a valid database connection string with supported protocol",
      );
    });

    test("individual connection fields enforce constraints", () => {
    expect(DATABASE_HOST.parse("localhost")).toBe("localhost");
    expectZodMessage(() => DATABASE_HOST.parse(""), "Database host is required");

    expect(DATABASE_PORT.parse(5432)).toBe(5432);
    expectZodMessage(() => DATABASE_PORT.parse(0), "Port must be greater than 0");

    expect(DATABASE_NAME.parse("app_db")).toBe("app_db");
    expectZodMessage(
      () => DATABASE_NAME.parse("bad name"),
      "Database name must contain only letters, numbers, underscores, and hyphens",
    );

    expect(DATABASE_USERNAME.parse("admin")).toBe("admin");
    expectZodMessage(() => DATABASE_USERNAME.parse(""), "Database username is required");

    expect(DATABASE_PASSWORD.parse("secret")).toBe("secret");
    expectZodMessage(() => DATABASE_PASSWORD.parse(""), "Database password is required");

    expect(DATABASE_SCHEMA.parse("public")).toBe("public");
    expect(DATABASE_SCHEMA.parse(undefined)).toBeUndefined();
    expectZodMessage(
      () => DATABASE_SCHEMA.parse("bad-schema"),
      "Schema name must contain only letters, numbers, and underscores",
    );
      });

      test("pooling controls include sensible defaults", () => {
    expect(DATABASE_POOL_SIZE.parse(20)).toBe(20);
    expect(DATABASE_POOL_SIZE.parse(undefined)).toBe(10);
    expectZodMessage(() => DATABASE_POOL_SIZE.parse(0), "Pool size must be at least 1");

    expect(DATABASE_TIMEOUT.parse(1500)).toBe(1500);
    expect(DATABASE_TIMEOUT.parse(undefined)).toBe(30000);
    expectZodMessage(() => DATABASE_TIMEOUT.parse(500), "Timeout must be at least 1 second");

    expect(DATABASE_SSL.parse(undefined)).toBe(true);
    expect(DATABASE_SSL.parse(false)).toBe(false);
      });
  });
}
