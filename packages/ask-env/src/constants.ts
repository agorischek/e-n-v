import type { SecretPattern } from "./types";

export const DEFAULT_ENV_PATH = ".env";

export const DEFAULT_TRUNCATE_LENGTH = 40;

export const DEFAULT_SECRET_PATTERNS: ReadonlyArray<SecretPattern> = Object.freeze([
  /password/i,
  /passphrase/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /client[_-]?secret/i,
  /private[_-]?key/i,
  /(?:database|db|redis|mongo|sql|postgres|mysql)[_-]?(?:connection[_-]?)?(?:string|url)/i,
  /database(?:[_-]?url)?/i,
  /access[_-]?key/i,
  /credential/i,
]);