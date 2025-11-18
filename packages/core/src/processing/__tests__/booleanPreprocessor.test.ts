import { describe, expect, it } from "bun:test";

import { preprocessors } from "../preprocessors/preprocessors";

describe("booleanPreprocessor", () => {
  it("normalizes default truthy and falsy phrases", () => {
    const preprocess = preprocessors.boolean();

    expect(preprocess("on")).toBe(true);
    expect(preprocess("NO")).toBe(false);
  });

  it("supports custom phrase mappings", () => {
    const preprocess = preprocessors.boolean({
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
      preprocessors.boolean({
        true: ["y"],
        false: ["Y"],
      }),
    ).toThrowError(
      'Boolean preprocessor option value "y" cannot map to both true and false',
    );
  });
});
