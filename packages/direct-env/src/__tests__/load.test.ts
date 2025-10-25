import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { load, EnvMeta, MissingEnvVarError, ValidationError, schema } from "../index";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("direct-env", () => {
  const testEnvPath = join(tmpdir(), `.env.test.${Date.now()}`);

  beforeAll(async () => {
    await writeFile(
      testEnvPath,
      `PORT=3000
DATABASE_URL=postgres://localhost:5432/test
DEBUG=true
MAX_CONNECTIONS=100
MISSING_VALUE=
`
    );
  });

  afterAll(async () => {
    await unlink(testEnvPath).catch(() => {});
  });

  test("loads and validates environment variables", async () => {
    const env = await load({
      path: testEnvPath,
      vars: {
        PORT: schema.number(),
        DATABASE_URL: schema.string(),
        DEBUG: schema.boolean(),
        MAX_CONNECTIONS: schema.number(),
      },
    });

    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe("postgres://localhost:5432/test");
    expect(env.DEBUG).toBe(true);
    expect(env.MAX_CONNECTIONS).toBe(100);
  });

  test("uses default values", async () => {
    const env = await load({
      path: testEnvPath,
      vars: {
        TIMEOUT: schema.number({ default: 5000, required: false }),
        RETRY: schema.boolean({ default: false, required: false }),
      },
    });

    expect(env.TIMEOUT).toBe(5000);
    expect(env.RETRY).toBe(false);
  });

  test("throws MissingEnvVarError in strict mode", async () => {
    expect(async () => {
      await load({
        path: testEnvPath,
        vars: {
          REQUIRED_VAR: schema.string(),
        },
      });
    }).toThrow(MissingEnvVarError);
  });

  test("returns undefined for missing vars in non-strict mode", async () => {
    const env = await load(
      {
        path: testEnvPath,
        vars: {
          REQUIRED_VAR: schema.string(),
        },
      },
      { strict: false }
    );

    expect(env.REQUIRED_VAR).toBeUndefined();
  });

  test("throws ValidationError for invalid values", async () => {
    expect(async () => {
      await load({
        path: testEnvPath,
        vars: {
          DATABASE_URL: schema.number(), // This is a string in the file
        },
      });
    }).toThrow(ValidationError);
  });

  test("works with EnvMeta instance", async () => {
    const meta = new EnvMeta({
      path: testEnvPath,
      vars: {
        PORT: schema.number(),
        DEBUG: schema.boolean(),
      },
    });

    const env1 = await load(meta);
    expect(env1.PORT).toBe(3000);
    expect(env1.DEBUG).toBe(true);

    // Reuse the same meta
    const env2 = await load(meta);
    expect(env2.PORT).toBe(3000);
  });

  test("applies custom preprocessing", async () => {
    await writeFile(
      testEnvPath,
      `PERCENTAGE=50%
ENABLED=on
`
    );

    const env = await load(
      {
        path: testEnvPath,
        vars: {
          PERCENTAGE: schema.number(),
          ENABLED: schema.boolean(),
        },
      },
      {
        preprocess: {
          number: (value) => value.replace(/%$/, ""),
          bool: (value) => (value === "on" ? "true" : value),
        },
      }
    );

    expect(env.PERCENTAGE).toBe(50);
    expect(env.ENABLED).toBe(true);
  });

  test("handles empty values with defaults", async () => {
    const env = await load({
      path: testEnvPath,
      vars: {
        MISSING_VALUE: schema.string({ default: "fallback", required: false }),
      },
    });

    expect(env.MISSING_VALUE).toBe("fallback");
  });

  test("does not mutate process.env", async () => {
    // First restore the test file content
    await writeFile(
      testEnvPath,
      `PORT=3000
DATABASE_URL=postgres://localhost:5432/test
DEBUG=true
MAX_CONNECTIONS=100
MISSING_VALUE=
`
    );

    const originalEnv = { ...process.env };

    await load({
      path: testEnvPath,
      vars: {
        PORT: schema.number(),
      },
    });

    expect(process.env).toEqual(originalEnv);
  });
});
