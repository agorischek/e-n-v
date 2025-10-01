import type { SecretPattern } from "./types";

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