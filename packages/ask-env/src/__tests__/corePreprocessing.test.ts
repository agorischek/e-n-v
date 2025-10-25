import { describe, test, expect } from "bun:test";
import {
  resolvePreprocessor,
  type Preprocessors,
  type EnvVarSchemaDetails,
} from "@envcredible/core";
import { processValue } from "../prompts/processing/processValue";

describe("Core preprocessing integration", () => {
  test("resolvePreprocessor respects overrides", () => {
    const overrides: Preprocessors = {
      string: (value) => value.trim().toLowerCase(),
      number: (value) => value.replace(/,/g, ""),
      bool: (value) => (value.toLowerCase() === "on" ? "true" : "false"),
      enum: (value) => value.toLowerCase(),
    };

    const stringPre = resolvePreprocessor("string", overrides);
    expect(stringPre?.("  HELLO  ")).toBe("hello");

    const numberPre = resolvePreprocessor("number", overrides);
    expect(numberPre?.("1,000")).toBe("1000");

    const boolPre = resolvePreprocessor("boolean", overrides);
    expect(boolPre?.("on")).toBe("true");
    expect(boolPre?.("OFF")).toBe("false");

    const enumPre = resolvePreprocessor("enum", overrides);
    expect(enumPre?.("DEV")).toBe("dev");
  });

  test("defaults apply for number and boolean", () => {
    const numberPre = resolvePreprocessor("number");
    expect(numberPre?.("1,000")).toBe("1000");
    expect(numberPre?.(" 123 ")).toBe("123");
    expect(numberPre?.("not-a-number")).toBe("not-a-number");

    const boolPre = resolvePreprocessor("boolean");
    expect(boolPre?.("enabled")).toBe("true");
    expect(boolPre?.("inactive")).toBe("false");
    expect(boolPre?.("maybe")).toBe("maybe");

    expect(resolvePreprocessor("string")).toBeUndefined();
    expect(resolvePreprocessor("enum")).toBeUndefined();
  });

  test("null overrides disable defaults", () => {
    const overrides: Preprocessors = { number: null, bool: null };

    expect(resolvePreprocessor("number", overrides)).toBeUndefined();
    expect(resolvePreprocessor("boolean", overrides)).toBeUndefined();
  });

  test("processValue integrates preprocessing results", () => {
    const numberSchema: EnvVarSchemaDetails<number> = {
      type: "number",
      required: false,
      process: (input: string) => Number(input),
    };

    const booleanSchema: EnvVarSchemaDetails<boolean> = {
      type: "boolean",
      required: false,
      process: (input: string) => input.toLowerCase() === "true",
    };

    const numberResult = processValue("COUNT", "1,000", numberSchema);
    expect(numberResult.value).toBe(1000);
    expect(numberResult.isValid).toBe(true);

    const boolResult = processValue("FLAG", "enabled", booleanSchema);
    expect(boolResult.value).toBe(true);
    expect(boolResult.isValid).toBe(true);
  });

  test("custom preprocessors can return native types", () => {
    const numberSchema: EnvVarSchemaDetails<number> = {
      type: "number",
      required: false,
      process: (input: string) => Number(input),
    };

    const booleanSchema: EnvVarSchemaDetails<boolean> = {
      type: "boolean",
      required: false,
      process: (input: string) => input.toLowerCase() === "true",
    };

    const numberResult = processValue(
      "COUNT",
      "1,000",
      numberSchema,
      (raw) => parseInt(raw.replace(/,/g, ""), 10),
    );
    expect(numberResult.value).toBe(1000);
    expect(typeof numberResult.value).toBe("number");

    const booleanResult = processValue(
      "FLAG",
      "on",
      booleanSchema,
      (raw) => raw.toLowerCase() === "on",
    );
    expect(booleanResult.value).toBe(true);
    expect(typeof booleanResult.value).toBe("boolean");
  });
});
