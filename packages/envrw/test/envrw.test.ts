import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import EnvVarSource, { source as createSource } from "../index.ts";

async function createTempEnvSource() {
  const dir = await mkdtemp(join(tmpdir(), "envrw-"));
  const envPath = join(dir, ".env");
  const source = new EnvVarSource(envPath);
  return { dir, envPath, source } as const;
}

describe("EnvVarSource", () => {
  let envPath: string;
  let envSource: EnvVarSource;

  beforeEach(async () => {
    ({ envPath, source: envSource } = await createTempEnvSource());
  });

  it("writes new variables to an empty file", async () => {
    await envSource.write("APP", "value");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("APP=value\n");
  });

  it("provides a source convenience factory", async () => {
    const helper = createSource(envPath);
    expect(helper).toBeInstanceOf(EnvVarSource);

    await helper.write("FOO", "bar");
    const value = await helper.read("FOO");
    expect(value).toBe("bar");
  });

  it("replaces only the last assignment for an existing variable", async () => {
    await writeFile(envPath, "FOO=1\nBAR=2\nFOO=old\n", "utf8");
  await envSource.write("FOO", "updated");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("FOO=1\nBAR=2\nFOO=updated\n");
  });

  it("appends variables that are not found", async () => {
    await writeFile(envPath, "FOO=1\n", "utf8");
  await envSource.write({ BAR: "2", BAZ: "3" });
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("FOO=1\nBAR=2\nBAZ=3\n");
  });

  it("reads all, single, and multiple selections", async () => {
  await envSource.write({ APP: "app", URL: "https://example.com", EMPTY: "" });
  await envSource.write("URL", "https://override.test");
  const all = await envSource.read();
    expect(all).toEqual({ APP: "app", URL: "https://override.test", EMPTY: "" });

  const single = await envSource.read("URL");
    expect(single).toBe("https://override.test");

  const selection = await envSource.read(["URL", "APP", "MISSING"]);
    expect(selection).toEqual({ URL: "https://override.test", APP: "app", MISSING: undefined });
  });

  it("quotes values with spaces and preserves export prefix", async () => {
    await writeFile(envPath, "export NAME=old\n", "utf8");
  await envSource.write({ NAME: "new value", OTHER: "a b" });
    const content = await readFile(envPath, "utf8");
    expect(content).toBe('export NAME="new value"\nOTHER="a b"\n');
  });

  it("retains inline comments and avoids rewriting when value is unchanged", async () => {
    const initial = "DEBUG=hey # Testing\n";
    await writeFile(envPath, initial, "utf8");

  await envSource.write("DEBUG", "hey");

    const content = await readFile(envPath, "utf8");
    expect(content).toBe(initial);
  });

  it("keeps inline comments when updating values", async () => {
    await writeFile(envPath, "DEBUG=hey # Testing\n", "utf8");

  await envSource.write("DEBUG", "updated");

    const content = await readFile(envPath, "utf8");
    expect(content).toBe("DEBUG=updated # Testing\n");
  });

  it("supports literal newline values when reading and writing", async () => {
    await envSource.write("MULTI", "line1\nline2");
    let content = await readFile(envPath, "utf8");
    expect(content).toBe('MULTI="line1\nline2"\n');

    const value = await envSource.read("MULTI");
    expect(value).toBe("line1\nline2");

    await envSource.write("MULTI", "alpha\nbeta\ngamma");
    content = await readFile(envPath, "utf8");
    expect(content).toBe('MULTI="alpha\nbeta\ngamma"\n');
  });

  it("replaces multiline assignments in place", async () => {
    const initial = 'FOO="one"\nFOO="two\nthree"\nBAR=value\n';
    await writeFile(envPath, initial, "utf8");

    await envSource.write("FOO", "updated\nvalue");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe('FOO="one"\nFOO="updated\nvalue"\nBAR=value\n');

    const single = await envSource.read("FOO");
    expect(single).toBe("updated\nvalue");
  });

  it("parses existing multiline single quoted values", async () => {
    const initial = "FOO='a\nb'\nBAR=value\n";
    await writeFile(envPath, initial, "utf8");

    const value = await envSource.read("FOO");
    expect(value).toBe("a\nb");

    await envSource.write({ FOO: "x\ny", BAR: "z" });
    const content = await readFile(envPath, "utf8");
    expect(content).toBe('FOO="x\ny"\nBAR=z\n');
  });
});
