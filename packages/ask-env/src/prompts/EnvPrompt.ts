import { ThemedPrompt } from "./ThemedPrompt";
import {
  S_STEP_CANCEL,
  S_STEP_PREVIOUS,
  S_STEP_SKIP,
} from "../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptOptions } from "../vendor/PromptOptions";
import type { EnvVarSchemaDetails } from "@envcredible/core";
import type { EnvPromptOptions } from "./options/EnvPromptOptions";
import type { PromptOutcome } from "../types/PromptOutcome";
import { ClackPromptInternals } from "./utils/ClackPromptInternals";
import { Toolbar } from "./toolbar";

export type FooterState = "hint" | "warn" | "tools";

export abstract class EnvPrompt<
  TVar,
  TSchema extends EnvVarSchemaDetails<TVar> = EnvVarSchemaDetails<TVar>,
> extends ThemedPrompt<TVar> {
  protected readonly schema: TSchema;
  protected readonly required: boolean;
  protected readonly key: string;
  protected current?: TVar;
  protected default?: TVar;
  protected truncate: number;
  protected secret: boolean;
  protected revealSecret: boolean;
  protected allowSubmitFromOption: boolean;
  protected consumeNextSubmit: boolean;
  protected index: number;
  protected total: number;
  protected outcome: PromptOutcome;
  protected readonly internals: ClackPromptInternals<EnvPrompt<TVar, TSchema>>;
  protected readonly toolbar: Toolbar;
  private skipValidationFlag: boolean;

  constructor(
    schema: TSchema,
    opts: EnvPromptOptions<TVar> & PromptOptions<TVar, EnvPrompt<TVar, TSchema>>,
  ) {
    const promptOptions = {
      ...opts, // Include the subclass's validate function
      default: schema.default,
    } as EnvPromptOptions<TVar> & PromptOptions<TVar, EnvPrompt<TVar, TSchema>>;

    super(promptOptions);
    this.schema = schema;
    this.internals = new ClackPromptInternals(this);
    this.required = schema.required;
    // Disable base Prompt input tracking by default; subclasses toggle as needed
    this.internals.track = false;
    this.outcome = "commit";
    this.key = promptOptions.key;
    this.current = promptOptions.current;
    this.default = schema.default;
    this.truncate = promptOptions.truncate ?? 40;
    this.secret = Boolean(promptOptions.secret);
    this.revealSecret = false;
    this.allowSubmitFromOption = false;
    this.consumeNextSubmit = false;
    this.index = promptOptions.index ?? 0;
    this.total = promptOptions.total ?? 1;
    this.skipValidationFlag = false;

    // Initialize toolbar with callback methods
    this.toolbar = new Toolbar({
      previous: this.index > 0,
      secret: this.secret ? (this.revealSecret ? "shown" : "hidden") : false,
      theme: this.theme,
      actions: {
        toggleSecret: () => this.handleToggleSecret(),
        skip: () => this.handleSkip(),
        previous: () => this.handlePrevious(),
      },
    });

    this.on("finalize", () => {
      const shouldConsumeSubmit =
        this.consumeNextSubmit && !this.allowSubmitFromOption;

      if (!shouldConsumeSubmit) {
        this.resetSecretReveal();
      }

      this.toolbar.close();

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

  protected runSchemaValidation(
    value: string | undefined,
  ): { success: true; value: TVar | undefined } | { success: false; error: string } {
    if (!value || value.trim() === "") {
      return { success: true, value: undefined };
    }

    try {
      const processedValue = this.schema.process?.(value);
      return { success: true, value: processedValue };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  protected setCommittedValue(value: TVar | undefined): void {
    this.outcome = "commit";
    this.value = value as TVar;
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
    // The footer displays different content based on current state:
    // 1. "warn" - Show validation errors
    if (this.error) {
      return this.colors.warn(this.error);
    }

    // 2. "tools" - Show toolbar when open
    if (this.secret) {
      this.toolbar.secret = this.revealSecret ? "shown" : "hidden";
    }

    const toolbarOutput = this.toolbar.render();
    if (toolbarOutput) {
      return toolbarOutput;
    }

    // 3. "hint" - Show helpful hints when no error or toolbar
    const hint = this.buildSkipHint(baseHint);
    return this.colors.subtle(hint);
  }

  protected getFooterState(): FooterState {
    if (this.error) return "warn";
    if (this.toolbar.isOpen) return "tools"; 
    return "hint";
  }

  protected handleToolbarKey(char: string | undefined, info: Key): boolean {
    const handled = this.toolbar.handleKey(char, info);
    
    // Handle special cases for key handling flow
    if (handled && info?.name === "tab") {
      if (!this.toolbar.isOpen) {
        this.consumeNextSubmit = false;
        this.allowSubmitFromOption = false;
      }
      return true;
    }

    if (handled && (info?.name === "return" || info?.name === "enter")) {
      // When toolbar handles return/enter, prevent any further processing
      return true;
    }

    if (handled && info?.name === "escape") {
      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;
      return true;
    }

    if (handled && info?.name === "backspace") {
      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;
      return false;
    }

    if (handled && char && char.length === 1 && !info?.ctrl && !info?.meta) {
      this.consumeNextSubmit = false;
      this.allowSubmitFromOption = false;
      return false;
    }

    return handled;
  }

  protected shouldDimInputs(): boolean {
    return this.getFooterState() === "tools";
  }

  protected isOptionPickerOpen(): boolean {
    return this.getFooterState() === "tools";
  }

  protected truncateValue(value: string): string {
    if (value.length <= this.truncate) {
      return value;
    }
    return value.substring(0, this.truncate) + "...";
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
    // Update toolbar when secret reveal state changes
    if (this.secret) {
      this.toolbar.secret = this.revealSecret ? "shown" : "hidden";
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

  private handleToggleSecret(): void {
    this.consumeNextSubmit = true;
    this.skipValidationFlag = true;
    this.toggleSecretReveal();
  }

  private handleSkip(): void {
    this.allowSubmitFromOption = true;
    this.consumeNextSubmit = false;
    this.outcome = "skip";
    this.value = undefined as TVar;
    this.state = "submit";
  }

  private handlePrevious(): void {
    this.allowSubmitFromOption = true;
    this.consumeNextSubmit = false;
    this.outcome = "previous";
    this.value = undefined as TVar;
    this.state = "submit";
  }

  protected consumeSkipValidation(): boolean {
    if (!this.skipValidationFlag) {
      return false;
    }
    this.skipValidationFlag = false;
    return true;
  }
}
