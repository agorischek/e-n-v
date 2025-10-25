import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { EnvMeta } from "../EnvMeta";
import { schema } from "@envcredible/core";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("EnvMeta", () => {
  const testEnvPath = join(tmpdir(), `.env.meta-test.${Date.now()}`);

  beforeAll(async () => {
    await writeFile(testEnvPath, `PORT=3000\nDEBUG=true\n`);
  });

  afterAll(async () => {
    await unlink(testEnvPath).catch(() => {});
  });

  test("creates instance with resolved paths", () => {
    const meta = new EnvMeta({
      path: ".env",
      vars: {
        PORT: schema.number(),
      },
    });

    expect(meta.path).toBe(".env");
    expect(meta.channel).toBeDefined();
    expect(meta.schemas).toBeDefined();
    expect(Object.keys(meta.schemas)).toEqual(["PORT"]);
  });

  test("resolves relative paths with root", () => {
    const meta = new EnvMeta({
      path: ".env",
      root: "/app",
      vars: {
        PORT: schema.number(),
      },
    });

    expect(meta.path).toBe("/app/.env");
  });

  test("resolves file:// URLs", () => {
    const meta = new EnvMeta({
      path: ".env",
      root: "file:///app/index.ts",
      vars: {
        PORT: schema.number(),
      },
    });

    expect(meta.path).toBe("/app/.env");
  });

  test("resolves schemas from various types", () => {
    const meta = new EnvMeta({
      path: testEnvPath,
      vars: {
        PORT: schema.number(),
        DEBUG: schema.boolean(),
        NAME: schema.string({ default: "app" }),
      },
    });

    expect(Object.keys(meta.schemas)).toEqual(["PORT", "DEBUG", "NAME"]);
    expect(meta.schemas.PORT?.type).toBe("number");
    expect(meta.schemas.DEBUG?.type).toBe("boolean");
    expect(meta.schemas.NAME?.type).toBe("string");
  });

  test("channel can read values", async () => {
    const meta = new EnvMeta({
      path: testEnvPath,
      vars: {
        PORT: schema.number(),
        DEBUG: schema.boolean(),
      },
    });

    const values = await meta.channel.get();
    expect(values.PORT).toBe("3000");
    expect(values.DEBUG).toBe("true");
  });

  test("supports custom channel options", () => {
    const meta = new EnvMeta({
      path: testEnvPath,
      channel: "default",
      vars: {
        PORT: schema.number(),
      },
    });

    expect(meta.channel).toBeDefined();
    expect(meta.channel.constructor.name).toBe("DefaultEnvChannel");
  });
});
