/**
 * Error thrown when an environment variable fails validation
 */
export class ValidationError extends Error {
  public readonly key: string;
  public readonly value: string;
  public readonly originalError?: string;

  constructor(key: string, value: string, originalError?: string) {
    const message = originalError
      ? `Environment variable "${key}" validation failed: ${originalError}`
      : `Environment variable "${key}" validation failed for value "${value}"`;

    super(message);
    this.name = "ValidationError";
    this.key = key;
    this.value = value;
    this.originalError = originalError;
  }
}
