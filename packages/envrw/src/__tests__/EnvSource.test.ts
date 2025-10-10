import { beforeEach, describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";

import { EnvSource } from "../EnvSource.ts";
import { createTempEnvSource } from "./helpers.ts";

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
});
