import { describe, expect, it } from "bun:test";
import { parse } from "../parse";
import { EnvParseError } from "../errors/EnvParseError";
import { StringEnvVarSchema } from "@e-n-v/core";
import { EnvModel } from "@e-n-v/models";

describe("parse secret masking", () => {
  it("masks secret values and sanitizes messages when using parse options", () => {
    const schema = new StringEnvVarSchema({
      required: true,
      process(value: string): string {
        throw new Error(`Custom failure including value: ${value}`);
      },
    });

    expect.assertions(5);
    let thrown: unknown;
    try {
      parse(
        { API_KEY: "super-secret-token" },
        {
          schemas: { API_KEY: schema },
          secrets: ["API_KEY"],
        },
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    expect(thrown).toBeInstanceOf(EnvParseError);
    const issues = (thrown as EnvParseError).issues;
    expect(issues).toHaveLength(1);
    expect(issues[0]?.value).toBe("[secret]");
    expect(issues[0]?.message.includes("super-secret-token")).toBe(false);
  });

  it("respects schema-level secret flags when using an EnvModel instance", () => {
    const schema = new StringEnvVarSchema({
      required: true,
      secret: true,
      process(value: string): string {
        throw new Error(`Invalid secret: ${value}`);
      },
    });

    const model = new EnvModel({
      schemas: { PRIVATE_TOKEN: schema },
    });

    expect.assertions(5);
    let thrown: unknown;
    try {
      parse({ PRIVATE_TOKEN: "hidden-value" }, model);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    expect(thrown).toBeInstanceOf(EnvParseError);
    const issues = (thrown as EnvParseError).issues;
    expect(issues).toHaveLength(1);
    expect(issues[0]?.value).toBe("[secret]");
    expect(issues[0]?.message.includes("hidden-value")).toBe(false);
  });
});
