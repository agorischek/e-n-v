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
});
