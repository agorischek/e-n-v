import { describe, test, expect } from "bun:test";
import { applyPreprocessing } from "@envcredible/core";

describe("Core preprocessing integration", () => {
  test("applyPreprocessing works with all schema types", () => {
    const preprocessorOptions = {
      string: (value: string) => value.trim().toLowerCase(),
      number: (value: string) => value.replace(/,/g, ""),
      bool: (value: string) =>
        value.toLowerCase() === "on" ? "true" : "false",
      enum: (value: string) => value.toLowerCase(),
    };

    // Test string preprocessing
    expect(applyPreprocessing("  HELLO  ", "string", preprocessorOptions)).toBe(
      "hello",
    );

    // Test number preprocessing
    expect(applyPreprocessing("1,000", "number", preprocessorOptions)).toBe(
      "1000",
    );

    // Test boolean preprocessing
    expect(applyPreprocessing("on", "boolean", preprocessorOptions)).toBe(
      "true",
    );
    expect(applyPreprocessing("OFF", "boolean", preprocessorOptions)).toBe(
      "false",
    );

    // Test enum preprocessing
    expect(applyPreprocessing("DEV", "enum", preprocessorOptions)).toBe("dev");
  });

  test("default preprocessors work for number and boolean", () => {
    // Test default number preprocessing (removes commas)
    expect(applyPreprocessing("1,000", "number", undefined)).toBe("1000");
    expect(applyPreprocessing("10,000.50", "number", undefined)).toBe(
      "10000.50",
    );
    expect(applyPreprocessing(" 123 ", "number", undefined)).toBe("123");

    // Test default boolean preprocessing (handles common representations)
    expect(applyPreprocessing("on", "boolean", undefined)).toBe("true");
    expect(applyPreprocessing("OFF", "boolean", undefined)).toBe("false");
    expect(applyPreprocessing("enabled", "boolean", undefined)).toBe("true");
    expect(applyPreprocessing("ACTIVE", "boolean", undefined)).toBe("true");
    expect(applyPreprocessing("yes", "boolean", undefined)).toBe("true");

    expect(applyPreprocessing("off", "boolean", undefined)).toBe("false");
    expect(applyPreprocessing("DISABLED", "boolean", undefined)).toBe("false");
    expect(applyPreprocessing("inactive", "boolean", undefined)).toBe("false");
    expect(applyPreprocessing("NO", "boolean", undefined)).toBe("false");
  });

  test("default preprocessors pass through unparseable values", () => {
    // Numbers that can't be cleaned should pass through
    expect(applyPreprocessing("not-a-number", "number", undefined)).toBe(
      "not-a-number",
    );
    expect(applyPreprocessing("1,2,3,abc", "number", undefined)).toBe(
      "1,2,3,abc",
    );

    // Booleans that aren't recognized should pass through
    expect(applyPreprocessing("maybe", "boolean", undefined)).toBe("maybe");
    expect(applyPreprocessing("sometimes", "boolean", undefined)).toBe(
      "sometimes",
    );
    expect(applyPreprocessing("true", "boolean", undefined)).toBe("true"); // Standard values pass through
    expect(applyPreprocessing("false", "boolean", undefined)).toBe("false");
  });

  test("string and enum have no default preprocessing", () => {
    // String and enum should pass through unchanged when no custom preprocessor
    expect(applyPreprocessing("  test  ", "string", undefined)).toBe(
      "  test  ",
    );
    expect(applyPreprocessing("DEV", "enum", undefined)).toBe("DEV");
  });

  test("applyPreprocessing returns original value when no preprocessor provided", () => {
    expect(applyPreprocessing("test", "string", undefined)).toBe("test");
    expect(applyPreprocessing("test", "string", {})).toBe("test");
  });

  test("applyPreprocessing handles null/undefined preprocessors", () => {
    const preprocessorOptions = {
      string: null,
      number: undefined,
      bool: (value: string) => value.toLowerCase(),
    };

    expect(applyPreprocessing("TEST", "string", preprocessorOptions)).toBe(
      "TEST",
    );
    expect(applyPreprocessing("1,000", "number", preprocessorOptions)).toBe(
      "1000",
    ); // Default applied
    expect(applyPreprocessing("TRUE", "boolean", preprocessorOptions)).toBe(
      "true",
    );
  });

  test("preprocessing can return target types directly", () => {
    const preprocessorOptions = {
      number: (value: string) => parseInt(value.replace(/,/g, ""), 10),
      bool: (value: string) => value.toLowerCase() === "on",
    };

    const numberResult = applyPreprocessing<number>(
      "1,000",
      "number",
      preprocessorOptions,
    );
    expect(numberResult).toBe(1000);
    expect(typeof numberResult).toBe("number");

    const boolResult = applyPreprocessing<boolean>(
      "on",
      "boolean",
      preprocessorOptions,
    );
    expect(boolResult).toBe(true);
    expect(typeof boolResult).toBe("boolean");
  });
});
