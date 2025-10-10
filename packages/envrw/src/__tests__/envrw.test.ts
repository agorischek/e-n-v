import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { EnvSource, get, set, source as createSource } from "../index.ts";

async function createTempEnvSource() {
  const dir = await mkdtemp(join(tmpdir(), "envrw-"));
  const envPath = join(dir, ".env");
  const source = new EnvSource(envPath);
  return { dir, envPath, source } as const;
}

describe("EnvSource", () => {
  let envPath: string;
  let envSource: EnvSource;

  beforeEach(async () => {
    ({ envPath, source: envSource } = await createTempEnvSource());
  });

  it("writes new variables to an empty file", async () => {
    await envSource.write("APP", "value");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("APP=value\n");
  });

  it("round-trips values through the filesystem", async () => {
    await envSource.write({ APP: "app", URL: "https://example.com", EMPTY: "" });
    await envSource.write("URL", "https://override.test");

    const all = await envSource.read();
    expect(all).toEqual({ APP: "app", URL: "https://override.test", EMPTY: "" });

    const single = await envSource.read("URL");
    expect(single).toBe("https://override.test");

    const selection = await envSource.read(["URL", "APP", "MISSING"]);
    expect(selection).toEqual({ URL: "https://override.test", APP: "app", MISSING: undefined });
  });

  it("provides a source convenience factory", async () => {
    const helper = createSource(envPath);
    expect(helper).toBeInstanceOf(EnvSource);

    await helper.write("FOO", "bar");
    const value = await helper.read("FOO");
    expect(value).toBe("bar");
  });
});

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
