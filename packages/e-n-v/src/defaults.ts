import * as color from "picocolors";

/**
 * Default options for setup and other interactive features
 */
export const defaults = {
  /**
   * Default theme color (magenta)
   */
  theme: color.magenta,

  /**
   * Default secret patterns for masking sensitive values
   */
  secrets: [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /database[_-]?url/i,
    /db[_-]?url/i,
    /connection[_-]?string/i,
  ] as const,

  /**
   * Default truncation length for displayed values
   */
  truncate: 40,

  /**
   * Default env file path
   */
  path: ".env",
} as const;
