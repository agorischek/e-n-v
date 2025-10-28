import { describe, expect, it } from "bun:test";

import { booleanPreprocessor } from "../preprocessors";

describe("booleanPreprocessor", () => {
  it("normalizes default truthy and falsy phrases", () => {
    const preprocess = booleanPreprocessor();

    expect(preprocess("on")).toBe(true);
    expect(preprocess("ENABLED")).toBe(true);
    expect(preprocess(" inactive ")).toBe(false);
    expect(preprocess("NO")).toBe(false);
  });

  it("supports custom phrase mappings", () => {
    const preprocess = booleanPreprocessor({
      true: ["affirmative", "  absolutely  "],
      false: ["negative"],
    });

    expect(preprocess("Affirmative")).toBe(true);
    expect(preprocess("absolutely")).toBe(true);
    expect(preprocess("NEGATIVE")).toBe(false);
    expect(preprocess("maybe")).toBe("maybe");
  });

  it("throws when a phrase maps to both true and false", () => {
    expect(() =>
      booleanPreprocessor({
        true: ["y"],
        false: ["Y"],
      }),
    ).toThrowError(
      'Boolean preprocessor option value "y" cannot map to both true and false',
    );
  });
});
