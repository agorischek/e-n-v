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
    protected readonly substate: EnvPromptStateMachine;

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

      const hasSecret = Boolean(promptOptions.secret);
      const hasOptions = this.current !== undefined || this.default !== undefined;
      this.secret = hasSecret;
      this.substate = new EnvPromptStateMachine(
        createInitialSubstate({
          hasSecret,
          hasOptions,
          initialInputValue: "",
        }),
      );

      this.substate.subscribe((state: EnvPromptState) => {
        this.internals.track = state.shouldTrackInput;

        if (this.substate.hasSecret()) {
          this.toolbar.secret = state.secretVisibility === "revealed" ? "shown" : "hidden";
        }
      });

      this.toolbar = new Toolbar({
        previous: this.index > 0,
        secret: hasSecret
          ? this.substate.isSecretRevealed() ? "shown" : "hidden"
          : false,
        theme: this.theme,
        actions: {
          toggleSecret: () => this.handleToggleSecret(),
          skip: () => this.handleSkip(),
          previous: () => this.handlePrevious(),
        },
      });

      this.on("finalize", () => {
        const state = this.substate.state;
        const shouldConsumeSubmit = state.shouldConsumeSubmit;

        if (!shouldConsumeSubmit) {
          this.substate.resetSecretVisibility();
        }

        this.toolbar.close();

        if (shouldConsumeSubmit) {
          this.state = "active";
          this.error = "";
          this.substate.restoreValidation();
          this.substate.clearConsumeSubmit();
          this.substate.intention = "commit";
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
      this.substate.intention = "commit";
      this.value = value as TVar;
    }

    public getOutcome(): PromptOutcome {
      return this.substate.intention;
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
      if (this.error) {
        return this.colors.warn(this.error);
      }

      if (this.substate.hasSecret()) {
        this.toolbar.secret = this.substate.isSecretRevealed() ? "shown" : "hidden";
      }

      const toolbarOutput = this.toolbar.render();
      if (toolbarOutput) {
        return toolbarOutput;
      }

      const hint = this.buildSkipHint(baseHint);
      return this.colors.subtle(hint);
    }

    protected getFooterState(): FooterState {
      if (this.error) return "warn";
      if (this.substate.isToolbarOpen()) return "tools";
      return "hint";
    }

    protected handleToolbarKey(char: string | undefined, info: Key): boolean {
      const handled = this.toolbar.handleKey(char, info);

      if (handled && info?.name === "tab") {
        if (this.toolbar.isOpen) {
          this.substate.openToolbar();
        } else {
          this.substate.closeToolbar();
        }
        return true;
      }

      if (handled && (info?.name === "return" || info?.name === "enter")) {
        if (this.toolbar.isOpen) {
          this.substate.suppressValidation();
        }
        if (!this.toolbar.isOpen && this.substate.isToolbarOpen()) {
          this.substate.closeToolbar();
        }
        return true;
      }

      if (handled && info?.name === "escape") {
        this.substate.closeToolbar();
        return true;
      }

      if (handled && info?.name === "backspace") {
        this.substate.closeToolbar();
        return false;
      }

      if (handled && char && char.length === 1 && !info?.ctrl && !info?.meta) {
        this.substate.closeToolbar();
        return false;
      }

      if (handled && !this.toolbar.isOpen && this.substate.isToolbarOpen()) {
        this.substate.closeToolbar();
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
      const intention = this.substate.intention;

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
      if (!this.substate.hasSecret()) {
        return;
      }
      this.substate.toggleSecretVisibility();
      if (this.substate.hasSecret()) {
        this.toolbar.secret = this.substate.isSecretRevealed() ? "shown" : "hidden";
      }
    }

    protected resetSecretReveal(): void {
      if (!this.substate.hasSecret()) {
        return;
      }
      this.substate.resetSecretVisibility();
    }

    protected isSecretRevealed(): boolean {
      return this.substate.isSecretRevealed();
    }

    private handleToggleSecret(): void {
      this.toggleSecretReveal();
    }

    private handleSkip(): void {
      this.substate.intention = "skip";
      this.value = undefined as TVar;
      this.state = "submit";
    }

    private handlePrevious(): void {
      this.substate.intention = "previous";
      this.value = undefined as TVar;
      this.state = "submit";
    }

    protected consumeSkipValidation(): boolean {
      const state = this.substate.state;
      if (state.shouldSkipValidation) {
        this.substate.restoreValidation();
        return true;
      }
      return false;
    }
  }
