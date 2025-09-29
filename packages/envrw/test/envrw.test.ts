import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import EnvVarSource from "../index.ts";

async function createTempEnvSource() {
  const dir = await mkdtemp(join(tmpdir(), "envrw-"));
  const envPath = join(dir, ".env");
  const source = new EnvVarSource(envPath);
  return { dir, envPath, source } as const;
}

describe("EnvVarSource", () => {
  let envPath: string;
  let source: EnvVarSource;

  beforeEach(async () => {
    ({ envPath, source } = await createTempEnvSource());
  });

  it("writes new variables to an empty file", async () => {
    await source.write("APP", "value");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("APP=value\n");
  });

  it("replaces only the last assignment for an existing variable", async () => {
    await writeFile(envPath, "FOO=1\nBAR=2\nFOO=old\n", "utf8");
    await source.write("FOO", "updated");
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("FOO=1\nBAR=2\nFOO=updated\n");
  });

  it("appends variables that are not found", async () => {
    await writeFile(envPath, "FOO=1\n", "utf8");
    await source.write({ BAR: "2", BAZ: "3" });
    const content = await readFile(envPath, "utf8");
    expect(content).toBe("FOO=1\nBAR=2\nBAZ=3\n");
  });

  it("reads all, single, and multiple selections", async () => {
    await source.write({ APP: "app", URL: "https://example.com", EMPTY: "" });
    await source.write("URL", "https://override.test");
    const all = await source.read();
    expect(all).toEqual({ APP: "app", URL: "https://override.test", EMPTY: "" });

    const single = await source.read("URL");
    expect(single).toBe("https://override.test");

    const selection = await source.read(["URL", "APP", "MISSING"]);
    expect(selection).toEqual({ URL: "https://override.test", APP: "app", MISSING: undefined });
  });

  it("quotes values with spaces and preserves export prefix", async () => {
    await writeFile(envPath, "export NAME=old\n", "utf8");
    await source.write({ NAME: "new value", OTHER: "a b" });
    const content = await readFile(envPath, "utf8");
    expect(content).toBe('export NAME="new value"\nOTHER="a b"\n');
  });
});
