import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { AggregateEnvChannel } from "../AggregateEnvChannel";
import { DefaultEnvChannel } from "../../default/DefaultEnvChannel";
import { ProcessEnvChannel } from "../../process/ProcessEnvChannel";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("AggregateEnvChannel", () => {
  const testEnvPath1 = join(tmpdir(), `.env.test1.${Date.now()}`);
  const testEnvPath2 = join(tmpdir(), `.env.test2.${Date.now()}`);

  beforeAll(async () => {
    // Create test env files
    await writeFile(testEnvPath1, "VAR1=from-file1\nVAR2=from-file1\n");
    await writeFile(testEnvPath2, "VAR2=from-file2\nVAR3=from-file2\n");
  });

  afterAll(async () => {
    await unlink(testEnvPath1).catch(() => {});
    await unlink(testEnvPath2).catch(() => {});
  });

  test("combines values from multiple channels with overwrite=true", async () => {
    const channel = new AggregateEnvChannel(
      [
        { name: "default" } as any, // Would need proper config
      ],
      true
    );

    // Manually create with actual channels
    const channel1 = new DefaultEnvChannel(testEnvPath1);
    const channel2 = new DefaultEnvChannel(testEnvPath2);
    
    const aggregate = new AggregateEnvChannel(
      [
        { name: "default" } as any,
        { name: "default" } as any,
      ],
      true
    );
    
    // Replace internal channels for testing
    (aggregate as any).channels = [channel1, channel2];

    const values = await aggregate.get();

    // With overwrite=true, later channels override earlier ones
    expect(values.VAR1).toBe("from-file1"); // Only in file1
    expect(values.VAR2).toBe("from-file2"); // In both, file2 wins
    expect(values.VAR3).toBe("from-file2"); // Only in file2
  });

  test("combines values with overwrite=false", async () => {
    const channel1 = new DefaultEnvChannel(testEnvPath1);
    const channel2 = new DefaultEnvChannel(testEnvPath2);
    
    const aggregate = new AggregateEnvChannel(
      [
        { name: "default" } as any,
        { name: "default" } as any,
      ],
      false
    );
    
    (aggregate as any).channels = [channel1, channel2];

    const values = await aggregate.get();

    // With overwrite=false, earlier channels take precedence
    expect(values.VAR1).toBe("from-file1"); // Only in file1
    expect(values.VAR2).toBe("from-file1"); // In both, file1 wins
    expect(values.VAR3).toBe("from-file2"); // Only in file2
  });

  test("writes to all channels in aggregate", async () => {
    const channel1 = new DefaultEnvChannel(testEnvPath1);
    const channel2 = new DefaultEnvChannel(testEnvPath2);
    
    const aggregate = new AggregateEnvChannel(
      [
        { name: "default" } as any,
        { name: "default" } as any,
      ],
      true
    );
    
    (aggregate as any).channels = [channel1, channel2];

    await aggregate.set({ NEW_VAR: "new-value" });

    // Check both channels have the new value
    const values1 = await channel1.get();
    const values2 = await channel2.get();

    expect(values1.NEW_VAR).toBe("new-value");
    expect(values2.NEW_VAR).toBe("new-value");
  });

  test("throws error if no channels provided", () => {
    expect(() => {
      new AggregateEnvChannel([], true);
    }).toThrow("AggregateEnvChannel requires at least one channel configuration");
  });

  test("defaults to overwrite=true", async () => {
    const channel1 = new DefaultEnvChannel(testEnvPath1);
    const channel2 = new DefaultEnvChannel(testEnvPath2);
    
    const aggregate = new AggregateEnvChannel(
      [
        { name: "default" } as any,
        { name: "default" } as any,
      ]
      // No overwrite parameter - should default to true
    );
    
    (aggregate as any).channels = [channel1, channel2];

    const values = await aggregate.get();

    // Should behave like overwrite=true
    expect(values.VAR2).toBe("from-file2"); // Later channel wins
  });
});
