import { Prompt } from "@clack/core";
import color from "picocolors";
import { Theme } from "../visuals/Theme";
import {
  S_BAR,
  S_BAR_END,
  S_STEP_ACTIVE,
  S_STEP_CANCEL,
  S_STEP_ERROR,
  S_STEP_SUBMIT,
} from "../visuals/symbols";
import { Readable, Writable } from "node:stream";

export interface ThemedPromptOptions<TValue, Self extends Prompt<TValue>> {
  render(this: Omit<Self, "prompt">): string | undefined;
  initialValue?: any;
  initialUserInput?: string;
  validate?:
    | ((value: TValue | undefined) => string | Error | undefined)
    | undefined;
  input?: Readable;
  output?: Writable;
  debug?: boolean;
  signal?: AbortSignal;
  theme?: Theme;
}

export abstract class ThemedPrompt<T> extends Prompt<T> {
  protected theme: Theme;

  constructor(opts: ThemedPromptOptions<T, ThemedPrompt<T>>, render?: boolean) {
    super(opts, render);
    this.theme = opts.theme || Theme.default;
  }

  /**
   * Get the appropriate symbol based on prompt state
   */
  protected getSymbol(): string {
    switch (this.state) {
      case "initial":
      case "active":
        return this.theme.primary(S_STEP_ACTIVE);
      case "error":
        return this.theme.warn(S_STEP_ERROR);
      case "submit":
        return this.theme.primary(S_STEP_SUBMIT);
      case "cancel":
        return this.theme.error(S_STEP_CANCEL);
      default:
        return this.theme.primary(S_STEP_ACTIVE);
    }
  }

  /**
   * Get bar color based on error state - yellow for errors, theme primary otherwise
   */
  protected getBarColor(barSymbol: string): string {
    return this.state === "error"
      ? this.theme.warn(barSymbol)
      : this.theme.primary(barSymbol);
  }

  /**
   * Get bar symbols with appropriate coloring
   */
  protected getBar(): string {
    return this.getBarColor(S_BAR);
  }

  protected getBarEnd(): string {
    return this.getBarColor(S_BAR_END);
  }

  /**
   * Color utilities for consistent theming
   */
  protected get colors() {
    return {
      primary: this.theme.primary,
      subtle: this.theme.subtle,
      warn: this.theme.warn,
      error: this.theme.error,
      // Common colors
      white: color.white,
      bold: color.bold,
      dim: color.dim,
      strikethrough: color.strikethrough,
    };
  }
}
