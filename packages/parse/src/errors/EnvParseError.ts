export type EnvParseIssueMissing = {
  type: "missing";
  key: string;
  message: string;
};

export type EnvParseIssueInvalid = {
  type: "invalid";
  key: string;
  value: string;
  message: string;
};

export type EnvParseIssue = EnvParseIssueMissing | EnvParseIssueInvalid;

export type EnvParseResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: EnvParseError<TValue> };

/**
 * Error thrown when parsing environment variables fails.
 * Collects all issues so callers can inspect them without relying on subclasses.
 */
export class EnvParseError<TValue = Record<string, unknown>> extends Error {
  public readonly issues: ReadonlyArray<EnvParseIssue>;
  public readonly partial: Partial<TValue>;

  constructor(params: { issues: EnvParseIssue[]; partial?: Partial<TValue> }) {
    const { issues, partial } = params;
    super(EnvParseError.formatMessage(issues));
    this.name = "EnvParseError";
    this.issues = Object.freeze([...issues]);
    this.partial = partial ?? {};
  }

  /** Number of issues encountered while parsing. */
  get issueCount(): number {
    return this.issues.length;
  }

  /** Keys that were missing but required. */
  get missing(): string[] {
    return this.issues
      .filter(
        (issue): issue is EnvParseIssueMissing => issue.type === "missing",
      )
      .map((issue) => issue.key);
  }

  /** Keys that were present but invalid. */
  get invalid(): string[] {
    return this.issues
      .filter(
        (issue): issue is EnvParseIssueInvalid => issue.type === "invalid",
      )
      .map((issue) => issue.key);
  }

  /**
   * Get all issue messages as a numbered list for easy logging.
   */
  formatIssues(): string {
    return this.issues
      .map((issue, index) => `${index + 1}. ${issue.message}`)
      .join("\n");
  }

  private static formatMessage(issues: EnvParseIssue[]): string {
    if (issues.length === 0) {
      return "Environment validation failed with no details.";
    }

    const header = `Environment validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:`;
    const lines = issues.map((issue) => {
      if (issue.type === "missing") {
        return `- ${issue.key}: ${issue.message}`;
      }

      return `- ${issue.key}: ${issue.message}`;
    });

    return [header, ...lines].join("\n");
  }
}
