import { ThemedPrompt } from "./ThemedPrompt";
import { Theme } from "../visuals/Theme";
import { SECRET_MASK_CHAR } from "../secret";
import { S_STEP_SKIP, S_STEP_CANCEL } from "../visuals/symbols";
import color from "picocolors";

export interface EnvPromptOptions<T> {
  key: string;
  description?: string;
  current?: T;
  default?: T;
  required: boolean;
  validate?: ((value: T | undefined) => string | Error | undefined) | undefined;
  theme?: Theme;
  maxDisplayLength?: number;
  secret?: boolean;
  mask?: string;
  secretToggleShortcut?: string;
}

export abstract class EnvPrompt<T> extends ThemedPrompt<T> {
  protected key: string;
  protected current?: T;
  protected default?: T;
  protected maxDisplayLength: number;
  protected secret: boolean;
  protected mask: string;
  protected revealSecret: boolean;
  protected secretToggleShortcut: string;

  constructor(opts: EnvPromptOptions<T> & any, render?: boolean) {
    super(opts, render);
    this.key = opts.key;
    this.current = opts.current;
    this.default = opts.default;
    this.maxDisplayLength = opts.maxDisplayLength ?? 40;
    this.secret = Boolean(opts.secret);
    this.mask = opts.mask ?? SECRET_MASK_CHAR;
    this.revealSecret = false;
    this.secretToggleShortcut = opts.secretToggleShortcut ?? "Ctrl+R";

    this.on("finalize", () => {
      this.resetSecretReveal();
    });
  }

  protected buildSkipHint(base?: string): string {
    const skipLower = "tab to skip";
    const skipCapitalized = "Tab to skip";

    if (base && base.trim().length > 0) {
      return `${base} or ${skipLower}`;
    }

    return skipCapitalized;
  }

  protected truncateValue(value: string): string {
    if (value.length <= this.maxDisplayLength) {
      return value;
    }
    return value.substring(0, this.maxDisplayLength) + "...";
  }

  protected renderSkipped(): string {
    const skipSymbol = this.colors.dim(this.theme.primary(S_STEP_SKIP));
    const keyText = this.colors.subtle(this.colors.bold(this.key));

    return `${skipSymbol}  ${keyText}`;
  }

  protected renderCancelled(): string {
    const cancelSymbol = this.theme.error(S_STEP_CANCEL);
    const keyText = this.colors.subtle(this.colors.bold(this.key));

    return `${cancelSymbol}  ${keyText}`;
  }

  protected toggleSecretReveal(): void {
    if (!this.secret) {
      return;
    }
    this.revealSecret = !this.revealSecret;
  }

  protected resetSecretReveal(): void {
    if (!this.secret) {
      return;
    }
    this.revealSecret = false;
  }

  protected isSecretRevealed(): boolean {
    return this.secret && this.revealSecret;
  }

  protected getSecretToggleHint(): string {
    const action = this.revealSecret ? "hide" : "show";
    return `${this.secretToggleShortcut} to ${action}`;
  }
}
