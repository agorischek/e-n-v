import type { EnvVarSchema } from "@e-n-v/core";

export type SecretPattern = RegExp | string;
export type SecretPatterns = ReadonlyArray<SecretPattern>;

export const DEFAULT_SECRET_PATTERNS: SecretPatterns = Object.freeze([
  /password/i,
  /passphrase/i,
  /secret/i,
  /(?<!expires[_-]?in[_-]?)token(?![_-]?(?:expires|expiry|expiration|ttl|lifetime|duration|age|max[_-]?age|validity))/i,
  /api[_-]?key/i,
  /client[_-]?secret/i,
  /private[_-]?key/i,
  /(?:database|db|redis|mongo|sql|postgres|mysql)[_-]?(?:connection[_-]?)?(?:string|url)/i,
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
  patterns: SecretPatterns,
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

export function shouldTreatAsSecret(
  key: string,
  schema: EnvVarSchema,
  patterns: SecretPatterns,
): boolean {
  if (schema.type !== "string") {
    return false;
  }

  if ("secret" in schema && schema.secret !== undefined) {
    return schema.secret;
  }

  return isSecretKey(key, schema.description, patterns);
}

export function resolveSecretPatterns(
  patterns?: ReadonlyArray<SecretPattern>,
): SecretPatterns {
  if (!patterns) {
    return DEFAULT_SECRET_PATTERNS;
  }

  if (patterns.length === 0) {
    return Object.freeze([]);
  }

  return Object.freeze([...patterns]);
}
