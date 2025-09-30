export type SecretPattern = string | RegExp;

export const SECRET_MASK_CHAR = "•";

export const DEFAULT_SECRET_PATTERNS: ReadonlyArray<SecretPattern> = Object.freeze([
  /password/i,
  /passphrase/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /client[_-]?secret/i,
  /private[_-]?key/i,
  /connection(?:[_-]?string)?/i,
  /database(?:[_-]?url)?/i,
  /access[_-]?key/i,
  /credential/i,
]);

function isSecretMatch(value: string | undefined, pattern: SecretPattern): boolean {
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
  patterns: ReadonlyArray<SecretPattern>
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

export function maskSecretValue(value: string, maskChar: string = SECRET_MASK_CHAR): string {
  if (!value) {
    return value;
  }

  return value.replace(/./g, maskChar);
}
