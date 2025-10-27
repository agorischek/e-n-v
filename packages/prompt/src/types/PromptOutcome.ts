export type PromptOutcome = "commit" | "skip" | "previous";

export interface EnvPromptResult<T> {
  outcome: PromptOutcome;
  value?: T;
}
