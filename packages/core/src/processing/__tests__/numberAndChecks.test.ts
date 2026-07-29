import { describe, expect, it } from "bun:test";

import { between } from "../checks/between";
import { custom } from "../checks/custom";
import { max } from "../checks/max";
import { min } from "../checks/min";
import { number } from "../processors/typed/number";

describe("number processor", () => {
  it("accepts complete finite numeric values", () => {
    const process = number();

    expect(process("12.5")).toBe(12.5);
    expect(process(12.5)).toBe(12.5);
  });

  it("rejects partial and non-finite numeric values", () => {
    const process = number();

    expect(() => process("12ms")).toThrow();
    expect(() => process("Infinity")).toThrow();
    expect(() => process(Infinity)).toThrow();
  });
});

describe("number checks", () => {
  it("rejects NaN for range checks", () => {
    expect(min(0)(NaN)).not.toEqual([]);
    expect(max(10)(NaN)).not.toEqual([]);
    expect(between(0, 10)(NaN)).not.toEqual([]);
  });
});

describe("custom check", () => {
  it("reports failures without explicit traits", () => {
    const check = custom(() => false);

    const first = check("value");
    const second = check("value");
    expect(first).toEqual(["a valid value"]);
    expect(second).toEqual(["a valid value"]);
    expect(first).not.toBe(second);
  });
});
