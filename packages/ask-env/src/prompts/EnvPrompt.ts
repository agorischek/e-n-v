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
import { padActiveRender } from "./utils/padActiveRender";
import { Toolbar } from "./toolbar";
import { EnvPromptMode } from "./state/EnvPromptMode";
import { createInitialModeDetails } from "./state/EnvPromptModeDetails";
import type { EnvPromptState } from "./state/EnvPromptModeDetails";

export type FooterState = "hint" | "warn" | "tools";

export abstract class EnvPrompt<
  TVar,
  TSchema extends EnvVarSchemaDetails<TVar> = EnvVarSchemaDetails<TVar>,
> extends ThemedPrompt<TVar> {
  /** Schema describing the environment variable. */
  protected readonly schema: TSchema;
  /** Flag indicating whether the variable must be provided. */
  protected readonly required: boolean;
  /** Environment variable key, e.g. `NODE_ENV`. */
  protected readonly key: string;
  /** Latest committed value for this prompt, if any. */
  protected current?: TVar;
  /** Fallback value supplied by the schema. */
  protected default?: TVar;
  /** Maximum number of characters to display before truncation. */
  protected truncate: number;
  /** Zero-based index of this prompt in the session. */
  protected index: number;
  /** Total number of prompts in the session. */
  protected total: number;
  /** Indicates whether the value should be treated as secret. */
  protected readonly secret: boolean;
  /** Internal helpers for managing clack prompt behavior. */
  protected readonly internals: ClackPromptInternals<EnvPrompt<TVar, TSchema>>;
  /** Toolbar instance controlling auxiliary actions. */
  protected readonly toolbar: Toolbar;
  /** State machine managing prompt interaction modes. */
  protected readonly mode: EnvPromptMode;

  constructor(
    schema: TSchema,
    opts: EnvPromptOptions<TVar> & PromptOptions<TVar, EnvPrompt<TVar, TSchema>>
  ) {
    const { pad = true, ...promptOpts } = opts as EnvPromptOptions<TVar> &
      PromptOptions<TVar, EnvPrompt<TVar, TSchema>> & { padRender?: boolean };

    const promptOptions = {
      ...promptOpts, // Include the subclass's validate function
      default: schema.default,
      render: pad ? padActiveRender(promptOpts.render) : promptOpts.render,
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

    const hasSecret = Boolean(promptOptions.secret);
    const hasOptions = this.current !== undefined || this.default !== undefined;
    this.secret = hasSecret;
    this.mode = new EnvPromptMode(
      createInitialModeDetails({
        hasSecret,
        hasOptions,
        initialInputValue: "",
      })
    );

    this.mode.subscribe((state: EnvPromptState) => {
      this.internals.track = state.shouldTrackInput;

      if (this.mode.hasSecret()) {
        this.toolbar.secret =
          state.secretVisibility === "revealed" ? "shown" : "hidden";
      }
    });

    this.toolbar = new Toolbar({
      previous: this.index > 0,
      secret: hasSecret
        ? this.mode.isSecretRevealed()
          ? "shown"
          : "hidden"
        : false,
      theme: this.theme,
      actions: {
        toggleSecret: () => this.handleToggleSecret(),
        skip: () => this.handleSkip(),
        previous: () => this.handlePrevious(),
      },
    });

    this.on("finalize", () => {
      const state = this.mode.state;
      const shouldConsumeSubmit = state.shouldConsumeSubmit;

      if (!shouldConsumeSubmit) {
        this.mode.resetSecretVisibility();
      }

      this.toolbar.close();

      if (shouldConsumeSubmit) {
        this.state = "active";
        this.error = "";
        this.mode.restoreValidation();
        this.mode.clearConsumeSubmit();
        this.mode.intention = "commit";
      }
    });
  }

  protected runSchemaValidation(
    value: string | undefined
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
    this.mode.intention = "commit";
    this.value = value as TVar;
  }

  public getOutcome(): PromptOutcome {
    return this.mode.intention;
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
    const errorFooter = this.renderFooterError();
    if (errorFooter) {
      return errorFooter;
    }

    const toolbarFooter = this.renderFooterToolbar();
    if (toolbarFooter) {
      return toolbarFooter;
    }

    return this.renderFooterHint(baseHint);
  }

  private renderFooterError(): string | undefined {
    if (!this.error) {
      return undefined;
    }
    return this.colors.warn(this.error);
  }

  private renderFooterToolbar(): string | undefined {
    if (this.mode.hasSecret()) {
      this.toolbar.secret = this.mode.isSecretRevealed() ? "shown" : "hidden";
    }

    const toolbarOutput = this.toolbar.render();
    if (!toolbarOutput) {
      return undefined;
    }
    return toolbarOutput;
  }

  private renderFooterHint(baseHint?: string): string {
    const hint = this.buildSkipHint(baseHint);
    return this.colors.subtle(hint);
  }

  protected getFooterState(): FooterState {
    if (this.error) return "warn";
    if (this.mode.isToolbarOpen()) return "tools";
    return "hint";
  }

  protected handleToolbarKey(char: string | undefined, info: Key): boolean {
    const handled = this.toolbar.handleKey(char, info);

    if (handled && info?.name === "tab") {
      if (this.toolbar.isOpen) {
        this.mode.openToolbar();
      } else {
        this.mode.closeToolbar();
      }
      return true;
    }

    if (handled && (info?.name === "return" || info?.name === "enter")) {
      if (this.toolbar.isOpen) {
        this.mode.suppressValidation();
      }
      if (!this.toolbar.isOpen && this.mode.isToolbarOpen()) {
        this.mode.closeToolbar();
      }
      return true;
    }

    if (handled && info?.name === "escape") {
      this.mode.closeToolbar();
      return true;
    }

    if (handled && info?.name === "backspace") {
      this.mode.closeToolbar();
      return false;
    }

    if (handled && char && char.length === 1 && !info?.ctrl && !info?.meta) {
      this.mode.closeToolbar();
      return false;
    }

    if (handled && !this.toolbar.isOpen && this.mode.isToolbarOpen()) {
      this.mode.closeToolbar();
    }

    return handled;
  }
  protected truncateValue(value: string): string {
    if (value.length <= this.truncate) {
      return value;
    }
    return `${value.substring(0, this.truncate)}...`;
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
    const intention = this.mode.intention;

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
    if (!this.mode.hasSecret()) {
      return;
    }
    this.mode.toggleSecretVisibility();
    if (this.mode.hasSecret()) {
      this.toolbar.secret = this.mode.isSecretRevealed() ? "shown" : "hidden";
    }
  }

  protected resetSecretReveal(): void {
    if (!this.mode.hasSecret()) {
      return;
    }
    this.mode.resetSecretVisibility();
  }

  protected isSecretRevealed(): boolean {
    return this.mode.isSecretRevealed();
  }

  private handleToggleSecret(): void {
    this.toggleSecretReveal();
  }

  private handleSkip(): void {
    this.mode.intention = "skip";
    this.value = undefined as TVar;
    this.state = "submit";
  }

  private handlePrevious(): void {
    this.mode.intention = "previous";
    this.value = undefined as TVar;
    this.state = "submit";
  }

  protected consumeSkipValidation(): boolean {
    const state = this.mode.state;
    if (state.shouldSkipValidation) {
      this.mode.restoreValidation();
      return true;
    }
    return false;
  }
}
