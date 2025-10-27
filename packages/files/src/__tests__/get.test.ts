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

  it("prefers the last assignment when retrieving all values", () => {
    const text = "FOO=first\nBAR=one\nFOO=second\n";
    const values = get(text);
    expect(values.FOO).toBe("second");
    expect(values.BAR).toBe("one");
  });

  it("returns the most recent value for single key lookups", () => {
    const text = "FOO=alpha\nFOO=beta\n";
    const value = get(text, "FOO");
    expect(value).toBe("beta");
  });

  it("skips duplicate assignments for unresolved targets", () => {
    const text = [
      "BAR=initial",
      "FOO=older",
      "FOO=old",
      "BAR=new",
      "FOO=mid",
      "FOO=latest",
    ].join("\n");

    const values = get(text, ["FOO", "BAR"]);
    expect(values.FOO).toBe("latest");
    expect(values.BAR).toBe("new");
  });

  it("ignores malformed assignments once targets are satisfied", () => {
    const text = [
      "1INVALID=value",
      "export BAD-NAME=value",
      "BAR=ready",
      "FOO=done",
    ].join("\n");

    const values = get(text, ["FOO", "BAR"]);
    expect(values.FOO).toBe("done");
    expect(values.BAR).toBe("ready");
  });
});
