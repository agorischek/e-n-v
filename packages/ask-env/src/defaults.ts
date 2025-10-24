export const ENV_PATH = ".env";

export const TRUNCATE_LENGTH = 40;

export const SECRET_PATTERNS: ReadonlyArray<RegExp | string> = Object.freeze([
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
