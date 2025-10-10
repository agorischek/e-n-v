import { describe, expect, it } from "bun:test";

import { get } from "../get.ts";
import { set } from "../set.ts";

describe("get", () => {
  it("retrieves values synchronously", () => {
    const text = "FOO=1\nBAR=two\n";

    expect(get(text)).toEqual({ FOO: "1", BAR: "two" });
    expect(get(text, "BAR")).toBe("two");
    expect(get(text, ["BAR", "BAZ"]).BAR).toBe("two");
  });

  it("supports literal newline values when reading", () => {
    const text = 'MULTI="line1\nline2"\n';
    const value = get(text, "MULTI");
    expect(value).toBe("line1\nline2");
  });

  it("parses existing multiline single quoted values", () => {
    const text = "FOO='a\nb'\nBAR=value\n";
    expect(get(text, "FOO")).toBe("a\nb");

    const updated = set(text, { FOO: "x\ny", BAR: "z" });
    expect(updated).toBe('FOO="x\ny"\nBAR=z\n');
  });
});
