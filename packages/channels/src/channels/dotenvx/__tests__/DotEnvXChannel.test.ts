import { describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DotEnvXChannel } from "../DotEnvXChannel";
import type { DotEnvXInstance } from "../DotEnvXInstance";

describe("DotEnvXChannel", () => {
  it("waits for dotenvx writes to finish", async () => {
    const directory = await mkdtemp(join(tmpdir(), "e-n-v-dotenvx-"));
    let releaseWrite: (() => void) | undefined;
    const writeStarted = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    const writes: Array<[string, string]> = [];
    const dotenvx: DotEnvXInstance = {
      async get() {
        return "";
      },
      async set(key, value) {
        await writeStarted;
        writes.push([key, value]);
      },
      config() {
        return { parsed: {} } as never;
      },
    };

    try {
      const channel = new DotEnvXChannel(dotenvx, join(directory, ".env"));
      const setting = channel.set({ API_KEY: "value" });

      expect(writes).toEqual([]);
      releaseWrite?.();
      await setting;

      expect(writes).toEqual([["API_KEY", "value"]]);
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
