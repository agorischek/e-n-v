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

export interface ThemedPromptOptions {
  theme?: Theme;
  [key: string]: any; // Allow other options to pass through
}

export abstract class ThemedPrompt<T> extends Prompt<T> {
  protected theme: Theme;

  constructor(opts: ThemedPromptOptions & any, render?: boolean) {
    super(opts, render);
    this.theme = opts.theme || new Theme(opts.themeColor || color.cyan);
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
