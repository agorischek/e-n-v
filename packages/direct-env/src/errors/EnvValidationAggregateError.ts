import { MissingEnvVarError } from "./MissingEnvVarError";
import { ValidationError } from "./ValidationError";

/**
 * Aggregate error thrown when multiple environment variables fail validation
 */
export class EnvValidationAggregateError extends Error {
  public readonly errors: Array<MissingEnvVarError | ValidationError>;
  public readonly missingVars: string[];
  public readonly invalidVars: string[];

  constructor(errors: Array<MissingEnvVarError | ValidationError>) {
    const missingVars = errors
      .filter((e): e is MissingEnvVarError => e instanceof MissingEnvVarError)
      .map((e) => e.key);

    const invalidVars = errors
      .filter((e): e is ValidationError => e instanceof ValidationError)
      .map((e) => e.key);

    const message = EnvValidationAggregateError.formatMessage(
      missingVars,
      invalidVars,
      errors
    );

    super(message);
    this.name = "EnvValidationAggregateError";
    this.errors = errors;
    this.missingVars = missingVars;
    this.invalidVars = invalidVars;
  }

  private static formatMessage(
    missingVars: string[],
    invalidVars: string[],
    errors: Array<MissingEnvVarError | ValidationError>
  ): string {
    const lines: string[] = [
      `Environment validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`,
    ];

    // Format all errors in order
    for (const error of errors) {
      if (error instanceof MissingEnvVarError) {
        lines.push(`- ${error.key}: Value is missing`);
      } else if (error instanceof ValidationError) {
        const errorMsg = error.originalError || `"${error.value}" is invalid`;
        lines.push(`- ${error.key}: ${errorMsg}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Get all error messages as a formatted string
   */
  public getDetailedMessage(): string {
    return this.errors
      .map((e, i) => `${i + 1}. ${e.message}`)
      .join("\n");
  }
}
