import { describe, expect, it } from "bun:test";

import { a } from "../arraySchema";

describe("array schema builder", () => {
  it("splits string values using the default comma delimiter", () => {
    const schema = a.array().string();

    expect(schema.process("one,two,three")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("trims whitespace around elements", () => {
    const schema = a.array().string();

    expect(schema.process(" one ,  two , three  ")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("supports custom delimiters", () => {
    const schema = a.array("|").string();

    expect(schema.process("alpha|beta|gamma")).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("returns undefined for empty or whitespace-only values", () => {
    const schema = a.array().string();

    expect(schema.process("")).toBeUndefined();
    expect(schema.process("   ")).toBeUndefined();
    expect(schema.process(",,,")).toBeUndefined();
  });
});
