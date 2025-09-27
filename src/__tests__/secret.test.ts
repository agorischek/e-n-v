import { describe, expect, it } from "bun:test";
import {
  DEFAULT_SECRET_PATTERNS,
  maskSecretValue,
  isSecretKey,
  SECRET_MASK_CHAR,
} from "../secret";

describe("secret utilities", () => {
  it("masks values using the default mask", () => {
    expect(maskSecretValue("hunter2")).toBe(SECRET_MASK_CHAR.repeat(7));
  });

  it("masks values using a custom mask character", () => {
    expect(maskSecretValue("hunter2", "*")).toBe("*******");
  });

  it("detects secrets by key using default patterns", () => {
    expect(isSecretKey("API_KEY", undefined, DEFAULT_SECRET_PATTERNS)).toBe(
      true
    );
    expect(isSecretKey("PUBLIC_URL", undefined, DEFAULT_SECRET_PATTERNS)).toBe(
      false
    );
  });

  it("detects secrets based on descriptions", () => {
    expect(
      isSecretKey(
        "SOME_VALUE",
        "Used as the OAuth client secret",
        DEFAULT_SECRET_PATTERNS
      )
    ).toBe(true);
  });

  it("respects user-provided patterns", () => {
    const patterns = [/custom/i];
    expect(isSecretKey("CUSTOM_TOKEN", undefined, patterns)).toBe(true);
    expect(isSecretKey("API_KEY", undefined, patterns)).toBe(false);
  });

  it("returns false when no patterns are provided", () => {
    expect(isSecretKey("ANYTHING", undefined, [])).toBe(false);
  });
});
