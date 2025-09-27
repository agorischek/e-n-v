import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { updateEnvValue, updateEnvContentValue, updateEnvValues } from "../DefaultEnvChannel";
import { writeFileSync, unlinkSync, existsSync } from "fs";

describe("updateEnv functions in DefaultEnvChannel", () => {
  const testFilePath = "./test.env";

  afterEach(() => {
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  describe("updateEnvContentValue", () => {
    it("should update an existing key value", () => {
      const content = `# Database config
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=old-key
# Server config
PORT=3000`;

      const result = updateEnvContentValue(content, "API_KEY", "new-key");

      expect(result).toBe(`# Database config
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=new-key
# Server config
PORT=3000`);
    });

    it("should preserve indentation", () => {
      const content = `# Config
  DATABASE_URL=postgresql://localhost:5432/mydb
    API_KEY=old-key
PORT=3000`;

      const result = updateEnvContentValue(content, "API_KEY", "new-key");

      expect(result).toBe(`# Config
  DATABASE_URL=postgresql://localhost:5432/mydb
    API_KEY=new-key
PORT=3000`);
    });

    it("should add quotes for values with spaces", () => {
      const content = `API_KEY=old-key`;
      const result = updateEnvContentValue(content, "API_KEY", "key with spaces");
      expect(result).toBe(`API_KEY="key with spaces"`);
    });

    it("should escape quotes in values", () => {
      const content = `API_KEY=old-key`;
      const result = updateEnvContentValue(content, "API_KEY", 'value with "quotes"');
      expect(result).toBe(`API_KEY="value with \\"quotes\\""`);
    });

    it("should handle empty values", () => {
      const content = `API_KEY=old-key`;
      const result = updateEnvContentValue(content, "API_KEY", "");
      expect(result).toBe(`API_KEY=`);
    });

    it("should add new key if not found", () => {
      const content = `DATABASE_URL=postgresql://localhost:5432/mydb
PORT=3000`;

      const result = updateEnvContentValue(content, "NEW_KEY", "new-value");

      expect(result).toBe(`DATABASE_URL=postgresql://localhost:5432/mydb
PORT=3000

NEW_KEY=new-value`);
    });

    it("should preserve comments and empty lines", () => {
      const content = `# Database configuration
DATABASE_URL=postgresql://localhost:5432/mydb

# API configuration
API_KEY=old-key

# Server configuration
PORT=3000`;

      const result = updateEnvContentValue(content, "API_KEY", "new-key");

      expect(result).toBe(`# Database configuration
DATABASE_URL=postgresql://localhost:5432/mydb

# API configuration
API_KEY=new-key

# Server configuration
PORT=3000`);
    });

    it("should handle keys with special regex characters", () => {
      const content = `MY.KEY=old-value
MY[KEY]=another-value
MY+KEY=plus-value`;

      const result = updateEnvContentValue(content, "MY.KEY", "new-value");

      expect(result).toBe(`MY.KEY=new-value
MY[KEY]=another-value
MY+KEY=plus-value`);
    });

    it("should handle values with special characters", () => {
      const content = `DATABASE_URL=old-url`;
      const result = updateEnvContentValue(
        content,
        "DATABASE_URL",
        "postgresql://user:pass@host:5432/db?sslmode=require"
      );
      expect(result).toBe(`DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require`);
    });

    it("should preserve trailing comments", () => {
      const content = `# Config file
API_KEY=old-key # This is the API key
PORT=3000 # Server port
DATABASE_URL=old-url # Database connection string`;

      const result = updateEnvContentValue(content, "API_KEY", "new-secret-key");

      expect(result).toBe(`# Config file
API_KEY=new-secret-key # This is the API key
PORT=3000 # Server port
DATABASE_URL=old-url # Database connection string`);
    });

    it("should handle quoted values with trailing comments", () => {
      const content = `MESSAGE="hello world" # Greeting message`;
      const result = updateEnvContentValue(content, "MESSAGE", "goodbye world");
      expect(result).toBe(`MESSAGE="goodbye world" # Greeting message`);
    });

    it("should not treat # inside quotes as comments", () => {
      const content = `PASSWORD="secret#123" # Real comment`;
      const result = updateEnvContentValue(content, "PASSWORD", "new#secret");
      expect(result).toBe(`PASSWORD=new#secret # Real comment`);
    });
  });

  describe("updateEnvValue", () => {
    it("should update a value in an actual file", () => {
      const content = `# Test config
API_KEY=old-key
PORT=3000`;

      writeFileSync(testFilePath, content);
      updateEnvValue(testFilePath, "API_KEY", "new-key");

      const result = require("fs").readFileSync(testFilePath, "utf8");
      expect(result).toBe(`# Test config
API_KEY=new-key
PORT=3000`);
    });
  });

  describe("updateEnvValues", () => {
    it("should update multiple values in an actual file", () => {
      const content = `# Test config
API_KEY=old-key
PORT=3000
DATABASE_URL=old-url`;

      writeFileSync(testFilePath, content);
      updateEnvValues(testFilePath, {
        API_KEY: "new-key",
        PORT: "8080",
        NEW_VAR: "new-value"
      });

      const result = require("fs").readFileSync(testFilePath, "utf8");
      expect(result).toBe(`# Test config
API_KEY=new-key
PORT=8080
DATABASE_URL=old-url

NEW_VAR=new-value`);
    });
  });
});