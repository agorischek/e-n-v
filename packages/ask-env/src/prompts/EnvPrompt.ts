import { ThemedPrompt } from "./ThemedPrompt";
import { Theme } from "../visuals/Theme";
import { SECRET_MASK_CHAR } from "../secret";
import {
  SKIP_SYMBOL,
  S_STEP_CANCEL,
  S_STEP_PREVIOUS,
  S_STEP_SKIP,
  PREVIOUS_SYMBOL,
  S_TOOL_ACTIVE,
  S_TOOL_INACTIVE,
} from "../visuals/symbols";
import color from "picocolors";
import type { Key } from "node:readline";

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
  previousEnabled?: boolean;
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
  protected optionMode: boolean;
  protected optionCursor: number;
  protected allowSubmitFromOption: boolean;
  protected consumeNextSubmit: boolean;
  protected previousEnabled: boolean;

  private get hasAnyPreviousValue(): boolean {
    if (!this.previousEnabled) {
      return false;
    }
    return this.current !== undefined || this.default !== undefined;
  }

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
    this.optionMode = false;
    this.optionCursor = 0;
    this.allowSubmitFromOption = false;
    this.consumeNextSubmit = false;
    this.previousEnabled = opts.previousEnabled ?? true;

    this.on("finalize", () => {
      const shouldConsumeSubmit =
        this.consumeNextSubmit && !this.allowSubmitFromOption;

      if (!shouldConsumeSubmit) {
        this.resetSecretReveal();
      }

      this.closeOptions();

      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;

      if (shouldConsumeSubmit) {
        this.state = "active";
        this.error = "";
      }
    });
  }

  protected buildSkipHint(base?: string): string {
    const skipLower = "tab for options";
    const skipCapitalized = "Tab for options";

    if (base && base.trim().length > 0) {
      return `${base} or ${skipLower}`;
    }

    return skipCapitalized;
  }

  protected renderFooter(baseHint?: string): string {
    if (this.optionMode) {
      const options = this.getFooterOptions();
      this.ensureOptionCursor(options);
      if (!options.length) {
        return this.colors.subtle("");
      }

      const separator = this.colors.subtle(" / ");
      const optionStrings = options.map((option, index) => {
        const isFocused = index === this.optionCursor;
        const icon = isFocused
          ? option.activeIcon ?? option.icon
          : option.icon;
        const label = icon ? `${icon} ${option.label}` : option.label;

        if (option.disabled) {
          return this.colors.dim(label);
        }

        return isFocused ? this.theme.primary(label) : this.colors.subtle(label);
      });

      return optionStrings.join(separator);
    }

    if (this.error) {
      return this.colors.warn(this.error);
    }

    const hint = this.buildSkipHint(baseHint);
    return this.colors.subtle(hint);
  }

  protected handleFooterKey(char: string | undefined, info: Key): boolean {
    if (!info) {
      return false;
    }

    if (info.name === "tab") {
      if (!this.optionMode) {
        this.openOptions();
      } else {
        this.consumeNextSubmit = false;
        this.allowSubmitFromOption = false;
        this.closeOptions();
      }
      return true;
    }

    if (!this.optionMode) {
      return false;
    }

    switch (info.name) {
      case "left":
      case "up":
        this.shiftOptionCursor(-1);
        return true;
      case "right":
      case "down":
        this.shiftOptionCursor(1);
        return true;
      case "return":
      case "enter":
        this.activateOption();
        return true;
      case "escape":
        this.consumeNextSubmit = false;
        this.allowSubmitFromOption = false;
        this.closeOptions();
        return true;
      case "backspace":
        this.consumeNextSubmit = false;
        this.allowSubmitFromOption = false;
        this.closeOptions();
        return false;
    }

    if (
      char &&
      char.length === 1 &&
      !info.ctrl &&
      !info.meta
    ) {
      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;
      this.closeOptions();
      return false;
    }

    return false;
  }

  protected shouldDimInputs(): boolean {
    return this.optionMode;
  }

  protected isOptionPickerOpen(): boolean {
    return this.optionMode;
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

  protected renderPrevious(): string {
    const previousSymbol = this.colors.dim(this.theme.primary(S_STEP_PREVIOUS));
    const keyText = this.colors.subtle(this.colors.bold(this.key));

    return `${previousSymbol}  ${keyText}`;
  }

  protected renderSymbolValue(value: symbol): string {
    if (value === SKIP_SYMBOL) {
      return this.renderSkipped();
    }

    if (value === PREVIOUS_SYMBOL) {
      return this.renderPrevious();
    }

    return this.renderSkipped();
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
    if (this.optionMode) {
      this.syncOptionCursor();
    }
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

  private openOptions(): void {
    this.optionMode = true;
    this.consumeNextSubmit = false;
    this.allowSubmitFromOption = false;
    const options = this.getFooterOptions();
    this.optionCursor = this.findInitialCursor(options);
  }

  protected closeOptions(): void {
    this.optionMode = false;
    this.optionCursor = 0;
  }

  private shiftOptionCursor(delta: number): void {
    const options = this.getFooterOptions();
    if (!options.length) {
      return;
    }

    let nextIndex = this.optionCursor;
    const len = options.length;
    for (let step = 0; step < len; step++) {
      nextIndex = (nextIndex + delta + len) % len;
      const option = options[nextIndex];
      if (option && !option.disabled) {
        this.optionCursor = nextIndex;
        return;
      }
    }
  }

  private activateOption(): void {
    const options = this.getFooterOptions();
    this.ensureOptionCursor(options);
    const selected = options[this.optionCursor];
    if (!selected || selected.disabled) {
      return;
    }

    this.allowSubmitFromOption = false;

    switch (selected.key) {
      case "skip":
        this.allowSubmitFromOption = true;
        this.consumeNextSubmit = false;
        this.closeOptions();
        this.value = SKIP_SYMBOL as any;
        this.state = "submit";
        break;
      case "previous":
        this.allowSubmitFromOption = true;
        this.consumeNextSubmit = false;
        this.closeOptions();
        this.value = PREVIOUS_SYMBOL as any;
        this.state = "submit";
        break;
      case "toggleSecret":
        this.consumeNextSubmit = true;
        this.toggleSecretReveal();
        break;
      case "close":
        this.consumeNextSubmit = true;
        this.closeOptions();
        break;
    }
  }

  private syncOptionCursor(): void {
    if (!this.optionMode) {
      return;
    }

    const options = this.getFooterOptions();
    this.ensureOptionCursor(options);
  }

  private ensureOptionCursor(options: FooterOption[]): void {
    if (!options.length) {
      this.optionCursor = 0;
      return;
    }

    if (this.optionCursor >= options.length) {
      this.optionCursor = this.findInitialCursor(options);
    }

    const current = options[this.optionCursor];
    if (current?.disabled) {
      this.optionCursor = this.findInitialCursor(options);
    }
  }

  private findInitialCursor(options: FooterOption[]): number {
    if (!options.length) {
      return 0;
    }

    const enabledIndex = options.findIndex((option) => !option.disabled);
    return enabledIndex >= 0 ? enabledIndex : 0;
  }

  private getFooterOptions(): FooterOption[] {
    const options: FooterOption[] = [
      {
        key: "skip",
        label: "Skip",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
      },
    ];

    if (this.previousEnabled) {
      options.push({
        key: "previous",
        label: "Previous",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
        disabled: !this.hasAnyPreviousValue,
      });
    }

    if (this.secret) {
      options.push({
        key: "toggleSecret",
        label: this.isSecretRevealed() ? "Hide" : "Show",
        icon: S_TOOL_INACTIVE,
        activeIcon: S_TOOL_ACTIVE,
      });
    }

    options.push({
      key: "close",
      label: "Close",
      icon: S_TOOL_INACTIVE,
      activeIcon: S_TOOL_ACTIVE,
    });

    return options;
  }
}

interface FooterOption {
  key: "skip" | "previous" | "toggleSecret" | "close";
  label: string;
  icon?: string;
  activeIcon?: string;
  disabled?: boolean;
}
