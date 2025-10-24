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
import { EnvPromptStateMachine } from "./state/EnvPromptStateMachine";
import { createInitialSubstate } from "./state/EnvPromptSubstate";
import type { EnvPromptState } from "./state/EnvPromptSubstate";

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
  protected index: number;
  protected total: number;
  protected readonly secret: boolean;
  protected readonly internals: ClackPromptInternals<EnvPrompt<TVar, TSchema>>;
  protected readonly toolbar: Toolbar;
  protected readonly stateMachine: EnvPromptStateMachine;

  constructor(
    schema: TSchema,
    opts: EnvPromptOptions<TVar> &
      PromptOptions<TVar, EnvPrompt<TVar, TSchema>>,
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
    this.key = promptOptions.key;
    this.current = promptOptions.current;
    this.default = schema.default;
    this.truncate = promptOptions.truncate ?? 40;
    this.index = promptOptions.index ?? 0;
    this.total = promptOptions.total ?? 1;

    // Initialize state machine
    const hasSecret = Boolean(promptOptions.secret);
    const hasOptions = this.current !== undefined || this.default !== undefined;
  this.secret = hasSecret;
    this.stateMachine = new EnvPromptStateMachine(
      createInitialSubstate({
        hasSecret,
        hasOptions,
        initialInputValue: "",
      })
    );

    // Subscribe to state changes to update internals and toolbar
    this.stateMachine.subscribe((state: EnvPromptState) => {
      this.internals.track = state.shouldTrackInput;
      
      // Update toolbar secret display
      if (this.stateMachine.hasSecret()) {
        this.toolbar.secret = state.secretVisibility === "revealed" ? "shown" : "hidden";
      }
    });

    // Initialize toolbar with callback methods
    this.toolbar = new Toolbar({
      previous: this.index > 0,
      secret: hasSecret ? (this.stateMachine.isSecretRevealed() ? "shown" : "hidden") : false,
      theme: this.theme,
      actions: {
        toggleSecret: () => this.handleToggleSecret(),
        skip: () => this.handleSkip(),
        previous: () => this.handlePrevious(),
      },
    });

    this.on("finalize", () => {
      const state = this.stateMachine.state;
      const shouldConsumeSubmit = state.shouldConsumeSubmit;

      if (!shouldConsumeSubmit) {
        this.stateMachine.resetSecretVisibility();
      }

      this.toolbar.close();

      if (shouldConsumeSubmit) {
        // Reset prompt to active state and clear the suppression
        this.state = "active";
        this.error = "";
        this.stateMachine.restoreValidation();
        this.stateMachine.clearConsumeSubmit();
        this.stateMachine.setIntention("commit");
      }
    });
  }

  protected runSchemaValidation(
    value: string | undefined,
  ):
    | { success: true; value: TVar | undefined }
    | { success: false; error: string } {
    if (!value || value.trim() === "") {
      return { success: true, value: undefined };
    }

    try {
      const processedValue = this.schema.process?.(value);
      return { success: true, value: processedValue };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  protected setCommittedValue(value: TVar | undefined): void {
    this.stateMachine.setIntention("commit");
    this.value = value as TVar;
  }

  public getOutcome(): PromptOutcome {
    return this.stateMachine.getIntention();
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
    if (this.stateMachine.hasSecret()) {
      this.toolbar.secret = this.stateMachine.isSecretRevealed() ? "shown" : "hidden";
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
    if (this.stateMachine.isToolbarOpen()) return "tools";
    return "hint";
  }

  protected handleToolbarKey(char: string | undefined, info: Key): boolean {
    const handled = this.toolbar.handleKey(char, info);

    // Handle special cases for key handling flow
    if (handled && info?.name === "tab") {
      // Update state machine to match toolbar state
      if (this.toolbar.isOpen) {
        this.stateMachine.openToolbar();
      } else {
        this.stateMachine.closeToolbar();
      }
      return true;
    }

    if (handled && (info?.name === "return" || info?.name === "enter")) {
      // When toolbar handles return/enter, the action has been executed
      // If toolbar is still open, it means the action didn't trigger submission
      if (this.toolbar.isOpen) {
        // Action like toggle secret - suppress validation to prevent submission
        this.stateMachine.suppressValidation();
      }
      if (!this.toolbar.isOpen && this.stateMachine.isToolbarOpen()) {
        this.stateMachine.closeToolbar();
      }
      // Always return true to prevent further processing
      return true;
    }

    if (handled && info?.name === "escape") {
      this.stateMachine.closeToolbar();
      return true;
    }

    if (handled && info?.name === "backspace") {
      this.stateMachine.closeToolbar();
      return false;
    }

    if (handled && char && char.length === 1 && !info?.ctrl && !info?.meta) {
      this.stateMachine.closeToolbar();
      return false;
    }

    if (handled && !this.toolbar.isOpen && this.stateMachine.isToolbarOpen()) {
      this.stateMachine.closeToolbar();
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
    const intention = this.stateMachine.getIntention();
    
    if (intention === "skip") {
      return this.renderSkipped();
    }

    if (intention === "previous") {
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
    if (!this.stateMachine.hasSecret()) {
      return;
    }
    this.stateMachine.toggleSecretVisibility();
    // Update toolbar when secret reveal state changes
    if (this.stateMachine.hasSecret()) {
      this.toolbar.secret = this.stateMachine.isSecretRevealed() ? "shown" : "hidden";
    }
  }

  protected resetSecretReveal(): void {
    if (!this.stateMachine.hasSecret()) {
      return;
    }
    this.stateMachine.resetSecretVisibility();
  }

  protected isSecretRevealed(): boolean {
    return this.stateMachine.isSecretRevealed();
  }

  private handleToggleSecret(): void {
    // Don't suppress validation here - let the toolbar key handler manage it
    this.toggleSecretReveal();
  }

  private handleSkip(): void {
    this.stateMachine.setIntention("skip");
    this.value = undefined as TVar;
    this.state = "submit";
  }

  private handlePrevious(): void {
    this.stateMachine.setIntention("previous");
    this.value = undefined as TVar;
    this.state = "submit";
  }

  protected consumeSkipValidation(): boolean {
    const state = this.stateMachine.state;
    if (state.shouldSkipValidation) {
      this.stateMachine.restoreValidation();
      return true;
    }
    return false;
  }
}
