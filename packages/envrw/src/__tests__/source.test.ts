import { describe, expect, it } from "bun:test";

import { EnvSource } from "../EnvSource.ts";
import { source as createSource } from "../source.ts";
import { createTempEnvPath } from "./helpers.ts";

describe("source", () => {
  it("provides a source convenience factory", async () => {
    const envPath = await createTempEnvPath();
    const helper = createSource(envPath);
    expect(helper).toBeInstanceOf(EnvSource);

    await helper.write("FOO", "bar");
    const value = await helper.read("FOO");
    expect(value).toBe("bar");
  });
});
