import { describe, expect, it } from "bun:test";
import {
  maskSecretValue,
  isSecretKey,
} from "../utils/secrets";
import { SECRET_MASK } from "../visuals/symbols";
import { SECRET_PATTERNS } from "../defaults";

describe("secret utilities", () => {
  it("masks values using the default mask", () => {
    expect(maskSecretValue("hunter2")).toBe(SECRET_MASK.repeat(7));
  });

  it("masks values using a custom mask character", () => {
    expect(maskSecretValue("hunter2", "*")).toBe("*******");
  });

  it("detects secrets by key using default patterns", () => {
    expect(isSecretKey("API_KEY", undefined, SECRET_PATTERNS)).toBe(
      true
    );
    expect(isSecretKey("PUBLIC_URL", undefined, SECRET_PATTERNS)).toBe(
      false
    );
  });

  it("detects secrets based on descriptions", () => {
    expect(
      isSecretKey(
        "SOME_VALUE",
        "Used as the OAuth client secret",
        SECRET_PATTERNS
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
