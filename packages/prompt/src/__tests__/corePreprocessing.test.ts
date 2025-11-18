import { describe, test, expect } from "bun:test";
import {
  resolvePreprocessor,
  type Preprocessors,
  type EnvVarSchemaDetails,
} from "@e-n-v/core";
import { processValue } from "../prompts/processing/processValue";

describe("Core preprocessing integration", () => {
  test("resolvePreprocessor respects overrides", () => {
    const overrides: Preprocessors = {
      string: (value) => value.trim().toLowerCase(),
      number: (value) => value.replace(/,/g, ""),
      boolean: (value) => (value.toLowerCase() === "on" ? "true" : "false"),
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
    expect(boolPre?.("yes")).toBe(true);
    expect(boolPre?.("off")).toBe(false);
    expect(boolPre?.("maybe")).toBe("maybe");

    expect(resolvePreprocessor("string")).toBeUndefined();
    expect(resolvePreprocessor("enum")).toBeUndefined();
  });

  test("false overrides disable defaults", () => {
    const overrides: Preprocessors = { number: false, boolean: false };

    expect(resolvePreprocessor("number", overrides)).toBeUndefined();
    expect(resolvePreprocessor("boolean", overrides)).toBeUndefined();
  });

  test("true overrides force built-in preprocessors", () => {
    const overrides: Preprocessors = {
      string: true,
      number: true,
      boolean: true,
      enum: true,
    };

    const stringPre = resolvePreprocessor("string", overrides);
    expect(stringPre?.(" value ")).toBe(" value ");

    const numberPre = resolvePreprocessor("number", overrides);
    expect(numberPre?.("1,234")).toBe("1234");

    const booleanPre = resolvePreprocessor("boolean", overrides);
    expect(booleanPre?.("yes")).toBe(true);

    const enumPre = resolvePreprocessor("enum", overrides);
    expect(enumPre?.("DEV")).toBe("DEV");
  });

  test("processValue integrates preprocessing results", () => {
    const numberSchema: EnvVarSchemaDetails<number> = {
      type: "number",
      required: false,
      process: (input: unknown) => {
        if (typeof input === "number") return input;
        return Number(input);
      },
    };

    const booleanSchema: EnvVarSchemaDetails<boolean> = {
      type: "boolean",
      required: false,
      process: (input: unknown) => {
        if (typeof input === "boolean") return input;
        return String(input).toLowerCase() === "true";
      },
    };

    const numberResult = processValue("COUNT", "1,000", numberSchema);
    expect(numberResult.value).toBe(1000);
    expect(numberResult.isValid).toBe(true);

    const boolResult = processValue("FLAG", "yes", booleanSchema);
    expect(boolResult.value).toBe(true);
    expect(boolResult.isValid).toBe(true);
  });

  test("custom preprocessors can return native types", () => {
    const numberSchema: EnvVarSchemaDetails<number> = {
      type: "number",
      required: false,
      process: (input: unknown) => {
        if (typeof input === "number") return input;
        return Number(input);
      },
    };

    const booleanSchema: EnvVarSchemaDetails<boolean> = {
      type: "boolean",
      required: false,
      process: (input: unknown) => {
        if (typeof input === "boolean") return input;
        return String(input).toLowerCase() === "true";
      },
    };

    const numberResult = processValue("COUNT", "1,000", numberSchema, (raw) =>
      parseInt(raw.replace(/,/g, ""), 10),
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

  test("boolean preprocessors accept options objects", () => {
    const overrides: Preprocessors = {
      boolean: {
        true: ["affirmative", "absolutely"],
        false: ["negative"],
      },
    };

    const boolPre = resolvePreprocessor("boolean", overrides);
    expect(boolPre?.("Affirmative")).toBe(true);
    expect(boolPre?.("NEGATIVE")).toBe(false);
    expect(boolPre?.("unknown")).toBe("unknown");
  });
});
