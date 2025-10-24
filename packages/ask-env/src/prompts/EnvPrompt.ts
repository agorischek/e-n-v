import { ThemedPrompt } from "./ThemedPrompt";
import { SECRET_MASK } from "../visuals/symbols";
import {
  S_STEP_CANCEL,
  S_STEP_PREVIOUS,
  S_STEP_SKIP,
  S_TOOL_ACTIVE,
  S_TOOL_INACTIVE,
} from "../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptOptions } from "../vendor/PromptOptions";
import type { EnvVarSchemaDetails } from "@envcredible/core";
import type { EnvPromptOptions } from "./options/EnvPromptOptions";
import type { FooterOption } from "../types/FooterOption";
import type { PromptOutcome } from "../types/PromptOutcome";

function resolveDefaultFromSpec<T>(
  spec: EnvVarSchemaDetails<T>,
): T | undefined {
  switch (spec.type) {
    case "boolean":
      return typeof spec.default === "boolean"
        ? (spec.default as T)
        : undefined;
    case "number":
      return typeof spec.default === "number"
        ? (spec.default as T)
        : undefined;
    case "enum":
    case "string":
      return typeof spec.default === "string"
        ? (spec.default as T)
        : undefined;
    default:
      return undefined;
  }
}

export abstract class EnvPrompt<
  T,
  TSpec extends EnvVarSchemaDetails<T> = EnvVarSchemaDetails<T>,
> extends ThemedPrompt<T> {
  protected readonly spec: TSpec;
  protected readonly required: boolean;
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
  protected outcome: PromptOutcome;
  private customValidate?: (value: T | undefined) => string | Error | undefined;
  private skipValidationFlag: boolean;

  protected set track(value: boolean) {
    (this as any)._track = value;
  }

  protected get track(): boolean {
    return (this as any)._track;
  }

  private get hasAnyPreviousValue(): boolean {
    return this.previousEnabled;
  }

  constructor(
    spec: TSpec,
    opts: EnvPromptOptions<T> & PromptOptions<T, EnvPrompt<T, TSpec>>,
  ) {
    const { originalValidate, ...restOptions } = opts as (EnvPromptOptions<T> &
      PromptOptions<T, EnvPrompt<T, TSpec>> &
      { originalValidate?: (value: T | undefined) => string | Error | undefined });

    const resolvedDefault =
      restOptions.default !== undefined
        ? restOptions.default
        : resolveDefaultFromSpec(spec);

    const promptOptions = {
      ...restOptions,
      default: resolvedDefault,
    } as EnvPromptOptions<T> & PromptOptions<T, EnvPrompt<T, TSpec>>;

    super(promptOptions);
    this.spec = spec;
    this.required = spec.required;
    // Disable base Prompt input tracking by default; subclasses toggle as needed
    this.track = false;
    this.outcome = "commit";
    this.key = promptOptions.key;
    this.current = promptOptions.current;
    this.default = promptOptions.default;
    this.maxDisplayLength = promptOptions.maxDisplayLength ?? 40;
    this.secret = Boolean(promptOptions.secret);
    this.mask = promptOptions.mask ?? SECRET_MASK;
    this.revealSecret = false;
    this.secretToggleShortcut = promptOptions.secretToggleShortcut ?? "Ctrl+R";
    this.optionMode = false;
    this.optionCursor = 0;
    this.allowSubmitFromOption = false;
    this.consumeNextSubmit = false;
    this.previousEnabled = promptOptions.previousEnabled ?? true;
    this.customValidate = originalValidate;
    this.skipValidationFlag = false;

    this.on("finalize", () => {
      const shouldConsumeSubmit =
        this.consumeNextSubmit && !this.allowSubmitFromOption;

      if (!shouldConsumeSubmit) {
        this.resetSecretReveal();
      }

      this.closeOptions(this.outcome === "commit");

      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;
      this.skipValidationFlag = false;

      if (shouldConsumeSubmit) {
        this.state = "active";
        this.error = "";
        this.outcome = "commit";
      }
    });
  }

  protected runCustomValidate(
    value: T | undefined,
  ): string | Error | undefined {
    if (!this.customValidate) {
      return undefined;
    }
    return this.customValidate(value);
  }

  protected setCommittedValue(value: T | undefined): void {
    this.outcome = "commit";
    this.value = value as T;
  }

  public getOutcome(): PromptOutcome {
    return this.outcome;
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
          ? (option.activeIcon ?? option.icon)
          : option.icon;
        const label = icon ? `${icon} ${option.label}` : option.label;

        if (option.disabled) {
          return this.colors.dim(label);
        }

        return isFocused
          ? this.theme.primary(label)
          : this.colors.subtle(label);
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

    if (char && char.length === 1 && !info.ctrl && !info.meta) {
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

  protected renderOutcomeResult(): string | undefined {
    if (this.outcome === "skip") {
      return this.renderSkipped();
    }

    if (this.outcome === "previous") {
      return this.renderPrevious();
    }

    return undefined;
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

  protected closeOptions(resetOutcome = true): void {
    this.optionMode = false;
    this.optionCursor = 0;
    if (resetOutcome) {
      this.outcome = "commit";
    }
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
        this.outcome = "skip";
        this.value = undefined as T;
        this.closeOptions(false);
        this.state = "submit";
        break;
      case "previous":
        this.allowSubmitFromOption = true;
        this.consumeNextSubmit = false;
        this.outcome = "previous";
        this.value = undefined as T;
        this.closeOptions(false);
        this.state = "submit";
        break;
      case "toggleSecret":
        this.consumeNextSubmit = true;
        this.skipValidationFlag = true;
        this.toggleSecretReveal();
        this.closeOptions();
        break;
      case "close":
        this.consumeNextSubmit = true;
        this.skipValidationFlag = true;
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
      label: "Return",
      icon: S_TOOL_INACTIVE,
      activeIcon: S_TOOL_ACTIVE,
    });

    return options;
  }

  protected consumeSkipValidation(): boolean {
    if (!this.skipValidationFlag) {
      return false;
    }
    this.skipValidationFlag = false;
    return true;
  }
}
