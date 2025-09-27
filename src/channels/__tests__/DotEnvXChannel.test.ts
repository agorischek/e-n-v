import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { DotEnvXChannel } from "../dotenvx/DotEnvXChannel";
import type { DotEnvXChannelOptions } from "./DotEnvXChannelOptions";
import { MockDotEnvXInstance } from "./MockDotEnvXInstance";
import { writeFileSync, unlinkSync, existsSync } from "fs";

describe("DotEnvXChannel", () => {
  const testFilePath = "./test-dotenvx.env";
  let accessor: DotEnvXChannel;
  let mockInstance: MockDotEnvXInstance;

  beforeEach(() => {
    // Clean up any existing test files
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
    mockInstance = new MockDotEnvXInstance();
  });
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  describe("constructor", () => {
    it("should create accessor with default options", () => {
      accessor = new DotEnvXChannel();
      const options = accessor.getOptions();
      
      expect(options.path).toBe(".env");
      expect(options.encoding).toBe("utf8");
      expect(options.overload).toBe(false);
      expect(options.debug).toBe(false);
      expect(options.encrypt).toBe(false);
      expect(options.strict).toBe(false);
      expect(options.ignore).toEqual([]);
    });

    it("should create accessor with custom options", () => {
      const customOptions: DotEnvXChannelOptions = {
        path: testFilePath,
        encoding: "latin1",
        overload: true,
        debug: true,
        encrypt: true,
        strict: true,
        ignore: ["MISSING_ENV_FILE"],
        convention: "nextjs",
        envKeysFile: ".env.keys"
      };

      accessor = new DotEnvXChannel(customOptions);
      const options = accessor.getOptions();
      
      expect(options.path).toBe(testFilePath);
      expect(options.encoding).toBe("latin1");
      expect(options.overload).toBe(true);
      expect(options.debug).toBe(true);
      expect(options.encrypt).toBe(true);
      expect(options.strict).toBe(true);
      expect(options.ignore).toEqual(["MISSING_ENV_FILE"]);
      expect(options.convention).toBe("nextjs");
      expect(options.envKeysFile).toBe(".env.keys");
    });

    it("should handle array paths and use first as primary", () => {
      accessor = new DotEnvXChannel({ path: [testFilePath, ".env.backup"] });
      expect(accessor.getPrimaryPath()).toBe(testFilePath);
    });
  });

  describe("get method", () => {
    beforeEach(() => {
      accessor = new DotEnvXChannel({ path: testFilePath });
    });

    it("should return undefined for missing file", () => {
      const value = accessor.get("MISSING_KEY");
      expect(value).toBeUndefined();
    });

    it("should return undefined for missing key in existing file", () => {
      writeFileSync(testFilePath, "EXISTING_KEY=value\n");
      
      const value = accessor.get("MISSING_KEY");
      expect(value).toBeUndefined();
    });

    it("should return value for existing key", () => {
      writeFileSync(testFilePath, "TEST_KEY=test_value\n");
      
      const value = accessor.get("TEST_KEY");
      expect(value).toBe("test_value");
    });

    it("should handle values with spaces and special characters", () => {
      writeFileSync(testFilePath, 'TEST_KEY="value with spaces"\nANOTHER_KEY=simple_value\n');
      
      expect(accessor.get("TEST_KEY")).toBe("value with spaces");
      expect(accessor.get("ANOTHER_KEY")).toBe("simple_value");
    });
  });

  describe("set method", () => {
    beforeEach(() => {
      accessor = new DotEnvXChannel({ path: testFilePath, encrypt: false });
    });

    it("should create file and set value", async () => {
      await accessor.set("NEW_KEY", "new_value");
      
      expect(existsSync(testFilePath)).toBe(true);
      expect(accessor.get("NEW_KEY")).toBe("new_value");
    });

    it("should update existing value", async () => {
      writeFileSync(testFilePath, "EXISTING_KEY=old_value\n");
      
      await accessor.set("EXISTING_KEY", "updated_value");
      
      expect(accessor.get("EXISTING_KEY")).toBe("updated_value");
    });

    it("should add new key to existing file", async () => {
      writeFileSync(testFilePath, "EXISTING_KEY=existing_value\n");
      
      await accessor.set("NEW_KEY", "new_value");
      
      expect(accessor.get("EXISTING_KEY")).toBe("existing_value");
      expect(accessor.get("NEW_KEY")).toBe("new_value");
    });
  });

  describe("clearCache method", () => {
    beforeEach(() => {
      accessor = new DotEnvXChannel({ path: testFilePath });
    });

    it("should reload values after cache clear", () => {
      writeFileSync(testFilePath, "TEST_KEY=original_value\n");
      
      // Load initial value
      expect(accessor.get("TEST_KEY")).toBe("original_value");
      
      // Modify file externally
      writeFileSync(testFilePath, "TEST_KEY=updated_value\n");
      
      // Should still return cached value
      expect(accessor.get("TEST_KEY")).toBe("original_value");
      
      // Clear cache and check again
      accessor.clearCache();
      expect(accessor.get("TEST_KEY")).toBe("updated_value");
    });
  });

  describe("getPrimaryPath method", () => {
    it("should return single path", () => {
      accessor = new DotEnvXChannel({ path: testFilePath });
      expect(accessor.getPrimaryPath()).toBe(testFilePath);
    });

    it("should return first path from array", () => {
      accessor = new DotEnvXChannel({ path: [testFilePath, ".env.backup"] });
      expect(accessor.getPrimaryPath()).toBe(testFilePath);
    });

    it("should return default path when none provided", () => {
      accessor = new DotEnvXChannel();
      expect(accessor.getPrimaryPath()).toBe(".env");
    });
  });
});