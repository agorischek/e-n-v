import { describe, expect, it } from "bun:test";

import { set } from "../set.ts";

describe("set", () => {
  it("replaces only the last assignment for an existing variable", () => {
    const initial = "FOO=1\nBAR=2\nFOO=old\n";
    const result = set(initial, "FOO", "updated");
    expect(result).toBe("FOO=1\nBAR=2\nFOO=updated\n");
  });

  it("appends variables that are not found", () => {
    const initial = "FOO=1\n";
    const result = set(initial, { BAR: "2", BAZ: "3" });
    expect(result).toBe("FOO=1\nBAR=2\nBAZ=3\n");
  });

  it("quotes values with spaces and preserves export prefix", () => {
    const initial = "export NAME=old\n";
    const result = set(initial, { NAME: "new value", OTHER: "a b" });
    expect(result).toBe('export NAME="new value"\nOTHER="a b"\n');
  });

  it("retains inline comments and avoids rewriting when value is unchanged", () => {
    const initial = "DEBUG=hey # Testing\n";
    const result = set(initial, "DEBUG", "hey");
    expect(result).toBe(initial);
  });

  it("keeps inline comments when updating values", () => {
    const initial = "DEBUG=hey # Testing\n";
    const result = set(initial, "DEBUG", "updated");
    expect(result).toBe("DEBUG=updated # Testing\n");
  });

  it("supports literal newline values when writing", () => {
    let content = "";
    content = set(content, "MULTI", "line1\nline2");
    expect(content).toBe('MULTI="line1\nline2"\n');

    content = set(content, "MULTI", "alpha\nbeta\ngamma");
    expect(content).toBe('MULTI="alpha\nbeta\ngamma"\n');
  });

  it("replaces multiline assignments in place", () => {
    const initial = 'FOO="one"\nFOO="two\nthree"\nBAR=value\n';
    const result = set(initial, "FOO", "updated\nvalue");
    expect(result).toBe('FOO="one"\nFOO="updated\nvalue"\nBAR=value\n');
  });

  it("returns empty content unchanged when no updates are provided", () => {
    const result = set("", {});
    expect(result).toBe("");
  });

  it("ensures a trailing newline when no updates are provided", () => {
    const result = set("FOO=1", {});
    expect(result).toBe("FOO=1\n");
  });

  it("preserves single-quoted values when unchanged", () => {
    const initial = "FOO='value'\nBAR=1\n";
    const result = set(initial, "FOO", "value");
    expect(result).toBe(initial);
  });

  it("appends new variables after the last entry when no trailing newline exists", () => {
    const initial = "FOO=1\nBAR=2\nBAZ=3";
    const result = set(initial, { NEW: "4" });
    expect(result).toBe("FOO=1\nBAR=2\nBAZ=3\nNEW=4\n");
  });

  it("normalizes carriage returns when serializing values", () => {
    const result = set("", { MULTI: "line1\r\nline2\rline3" });
    expect(result).toBe('MULTI="line1\nline2\nline3"\n');
  });

  it("escapes quotes and backslashes when quoting values", () => {
    const result = set("", { QUOTE: 'He said "hi" \\o/' });
    expect(result).toBe('QUOTE="He said \\"hi\\" \\\\o/"\n');
  });

  it("quotes empty string values", () => {
    const result = set("", { EMPTY: "" });
    expect(result).toBe('EMPTY=""\n');
  });

  it("preserves trailing comments on multiline assignments", () => {
    const initial = ['export MULTI="first', 'second" # comment', 'FOO=1', ''].join("\n");
    const result = set(initial, "MULTI", "updated\nvalue");
    const lines = result.split("\n");
    expect(lines.slice(0, 4)).toEqual(['export MULTI="updated', 'value" # comment', 'FOO=1', '']);
  });

  it("throws when value is missing for a named assignment", () => {
    expect(() => (set as any)("FOO=1\n", "BAR")).toThrow(new TypeError('Value for variable "BAR" must be provided'));
  });

  it("throws when an object value is undefined", () => {
    expect(() => (set as any)("", { FOO: undefined })).toThrow(
      new TypeError('Value for variable "FOO" must be provided'),
    );
  });

  it("rejects non-record arguments", () => {
    expect(() => (set as any)("", null)).toThrow(
      new TypeError("Argument must be a string name or an object of key-value pairs"),
    );
    expect(() => (set as any)("", ["A", "B"])).toThrow(
      new TypeError("Argument must be a string name or an object of key-value pairs"),
    );
    expect(() => (set as any)("", 42)).toThrow(
      new TypeError("Argument must be a string name or an object of key-value pairs"),
    );
  });

  it("supports bigint, boolean, and numeric inputs", () => {
    const result = set("", { COUNT: 42n, ENABLED: true, PORT: 8080 });
    expect(result).toBe('COUNT=42\nENABLED=true\nPORT=8080\n');
  });
});
