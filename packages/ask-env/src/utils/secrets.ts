import { SECRET_MASK } from "../visuals/symbols";

function isSecretMatch(
  value: string | undefined,
  pattern: RegExp | string,
): boolean {
  if (!value) {
    return false;
  }

  if (typeof pattern === "string") {
    const needle = pattern.trim().toLowerCase();
    if (!needle) {
      return false;
    }
    return value.toLowerCase().includes(needle);
  }

  pattern.lastIndex = 0;
  const matched = pattern.test(value);
  pattern.lastIndex = 0;
  return matched;
}

export function isSecretKey(
  key: string,
  description: string | undefined,
  patterns: ReadonlyArray<RegExp | string>,
): boolean {
  if (patterns.length === 0) {
    return false;
  }

  for (const pattern of patterns) {
    if (isSecretMatch(key, pattern) || isSecretMatch(description, pattern)) {
      return true;
    }
  }

  return false;
}

export function maskSecretValue(
  value: string,
  maskChar: string = SECRET_MASK,
): string {
  if (!value) {
    return value;
  }

  return value.replace(/./g, maskChar);
}
