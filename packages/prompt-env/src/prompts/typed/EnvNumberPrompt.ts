import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import {
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  S_CURSOR,
} from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import type { NumberEnvVarSchema } from "@envcredible/core";
import {
  buildSelectableOptions,
  resolveInitialCursor,
  type SelectableOption,
} from "../utils/selectableOptions";

type NumberPromptOption =
  | {
      type: "value";
      key: "current" | "default";
      value: number | undefined;
      display: string;
      annotation?: string;
      invalid?: boolean;
    }
  | { type: "other"; label: string };

export class EnvNumberPrompt extends EnvPrompt<number, NumberEnvVarSchema> {
  private otherInputCache = "";
  private shouldStitchInput = false;
  private isRestoringInput = false;

  constructor(schema: NumberEnvVarSchema, opts: EnvPromptOptions<number>) {
    super(schema, {
      ...opts,
      render: function (this: EnvNumberPrompt) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.formatValue(this.value),
          )}`;
        }

        if (this.state === "cancel") {
          return this.renderCancelled();
        }

        let output = "";

        // Add header line with symbol based on state and key in bold white and description in gray if provided
        output += `${this.getSymbol()}  ${this.colors.bold(
          this.colors.white(this.key),
        )}`;
        if (this.schema.description) {
          output += ` ${this.colors.subtle(this.schema.description)}`;
        }
        output += "\n";

        const dimInputs = !this.error && this.mode.isToolbarOpen();
        const hasPresetOptions = this.hasPresetOptions();

        if (!hasPresetOptions) {
          if (this.mode.isInInteraction("typing")) {
            const displayText = dimInputs
              ? this.colors.dim(this.getInputDisplay(false))
              : this.colors.white(this.getInputDisplay(true));
            output += `${this.getBar()}  ${displayText}`;
          } else {
            const idleDisplay = dimInputs
              ? this.colors.dim(this.getInputDisplay(false))
              : this.colors.white(this.getInputDisplay(true));
            output += `${this.getBar()}  ${idleDisplay}`;
          }

          output += "\n";
          output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

          return output;
        }

        const options = this.buildSelectionOptions();

        options.forEach((option: NumberPromptOption, index: number) => {
          const isSelected = index === this.mode.getCursor();
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (option.type === "other") {
            if (this.mode.isInInteraction("typing")) {
              const displayText = dimInputs
                ? this.colors.dim(this.getInputDisplay(false))
                : this.colors.white(this.getInputDisplay(true));
              output += `${this.getBar()}  ${circle} ${displayText}\n`;
            } else if (isSelected) {
              if (dimInputs) {
                output += `${this.getBar()}  ${circle} ${this.colors.dim(option.label)}\n`;
              } else {
                output += `${this.getBar()}  ${circle} ${this.colors.white(this.getInputDisplay(true))}\n`;
              }
            } else {
              const text = dimInputs
                ? this.colors.dim(option.label)
                : this.colors.subtle(option.label);
              output += `${this.getBar()}  ${circle} ${text}\n`;
            }
            return;
          }

          const formatText = (value: string): string => {
            if (dimInputs) {
              return this.colors.dim(value);
            }
            if (isSelected) {
              return this.colors.white(value);
            }
            return this.colors.subtle(value);
          };

          let text = formatText(option.display);
          if (option.invalid) {
            text = `\u001b[9m${text}\u001b[29m`;
          }

          const annotation = option.annotation ? ` (${option.annotation})` : "";
          let suffix = "";
          if (annotation && isSelected) {
            suffix = dimInputs
              ? this.colors.dim(annotation)
              : this.colors.subtle(annotation);
          }

          output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
        });

        output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

        return output;
      },
      validate: (_value: number | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }
        // If both current and default are undefined, we're in text-only mode
        const hasPresetOptions = this.hasPresetOptions();

        if (!hasPresetOptions) {
          if (!this.userInput || !this.userInput.trim()) {
            return "Please enter a number";
          }
          // If format is valid, run schema validation if provided
          const validation = this.runSchemaValidation(this.userInput);
          if (!validation.success) {
            return validation.error;
          }
          return undefined;
        }

        const selectedOption = this.getSelectedOption();

        if (
          !this.mode.isInInteraction("typing") &&
          selectedOption &&
          selectedOption.type === "value" &&
          selectedOption.key === "current" &&
          selectedOption.invalid
        ) {
          return this.currentResult?.error ?? "Current value is invalid";
        }

        // Calculate the text input index dynamically
        const textInputIndex = this.getTextInputIndex();
        // textInputIndex now points to the "Other" option

        // If we're on the custom entry option but not typing yet, start typing mode
        if (
          this.mode.getCursor() === textInputIndex &&
          !this.mode.isInInteraction("typing")
        ) {
          // Start typing mode instead of submitting
          this.mode.enterTyping();
          this.mode.clearInput();
          this._setUserInput("");
          this.otherInputCache = "";
          this.updateValue();
          return "Please enter a number"; // Show error since no input provided yet
        }

        // If we're typing on the custom option but haven't entered anything, prevent submission
        if (
          this.mode.getCursor() === textInputIndex &&
          this.mode.isInInteraction("typing") &&
          (!this.userInput || !this.userInput.trim())
        ) {
          return "Please enter a number";
        }

        // If we're typing, validate the input
        if (this.mode.isInInteraction("typing") && this.userInput) {
          const inputValidation = this.validateInput(this.userInput);
          if (inputValidation) {
            return inputValidation;
          }
          // If format is valid, run schema validation if provided
          const validation = this.runSchemaValidation(this.userInput);
          if (!validation.success) {
            return validation.error;
          }
        }

        // For non-typing cases (selecting current/default), validate the selected value
        if (!this.mode.isInInteraction("typing")) {
          const candidate =
            selectedOption && selectedOption.type === "value"
              ? selectedOption.value
              : this.value;
          const validation = this.runSchemaValidation(
            candidate !== undefined ? candidate.toString() : undefined,
          );
          if (!validation.success) {
            return validation.error;
          }
        }

        // All other cases are valid
        return undefined;
      },
    } as any);

    // If both current and default are undefined, start in typing mode
    if (!this.hasPresetOptions()) {
      this.mode.enterTyping();
      this.mode.clearInput();
      this._setUserInput("");
      this.otherInputCache = "";
      this.setCommittedValue(this.getDefaultValue());
    } else {
      const options = this.buildValueOptions();
      const currentValue =
        this.currentResult?.isValid !== false ? this.current : undefined;
      const defaultValue = this.default;

      const baseCursor = resolveInitialCursor(options, {
        currentValue,
        defaultValue,
      });

      const initialCursor = options[baseCursor]?.invalid
        ? options.length
        : baseCursor;

      this.mode.setCursor(initialCursor);
      this.updateValue();
      queueMicrotask(() => {
        const refreshedOptions = this.buildValueOptions();
        const refreshedBase = resolveInitialCursor(refreshedOptions, {
          currentValue,
          defaultValue,
        });
        const refreshedCursor = refreshedOptions[refreshedBase]?.invalid
          ? refreshedOptions.length
          : refreshedBase;
        this.mode.setCursor(refreshedCursor);
        this.updateValue();
      });
    }

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      this.clearErrorState();

      // If both current and default are undefined, we're in text-only mode - no cursor navigation
      if (!this.hasPresetOptions()) {
        return;
      }

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      switch (action) {
        case "up":
          // Calculate max index based on actual options
          const upOptions = this.buildSelectionOptions();
          const maxIndex = upOptions.length - 1;

          // If we're typing or on the text option, clear input and exit typing mode
          if (
            this.mode.isInInteraction("typing") ||
            this.mode.getCursor() === maxIndex
          ) {
            this.mode.exitTyping();
            this._clearUserInput(); // This clears the internal readline state too
            this.mode.clearInput();
            this.otherInputCache = "";
          }
          this.mode.moveCursor("up", maxIndex);
          break;
        case "down":
          // Calculate max index based on actual options
          const downOptions = this.buildSelectionOptions();
          const maxIndexDown = downOptions.length - 1;

          // If we're typing or on the text option, clear input and exit typing mode
          if (
            this.mode.isInInteraction("typing") ||
            this.mode.getCursor() === maxIndexDown
          ) {
            this.mode.exitTyping();
            this._clearUserInput(); // This clears the internal readline state too
            this.mode.clearInput();
            this.otherInputCache = "";
          }
          this.mode.moveCursor("down", maxIndexDown);
          break;
      }
      this.updateValue();
    });

    // Listen for user input changes (when typing)
    this.on("userInput", (rawInput: string) => {
      // Clear error state when user is typing (like base Prompt class does)
      this.clearErrorState();

      let input = rawInput.includes("\t")
        ? rawInput.replace(/\t/g, "")
        : rawInput;

      if (this.isRestoringInput) {
        this.isRestoringInput = false;
        this.otherInputCache = input;
        return;
      }

      if (this.mode.isInInteraction("typing")) {
        let nextInput = input;

        if (this.shouldStitchInput && this.otherInputCache) {
          if (!input || input === this.otherInputCache) {
            nextInput = this.otherInputCache;
            // keep shouldStitchInput true until new characters arrive
          } else if (input.startsWith(this.otherInputCache)) {
            nextInput = input;
            this.shouldStitchInput = false;
          } else {
            nextInput = `${this.otherInputCache}${input}`;
            this.shouldStitchInput = false;
          }
        } else {
          this.shouldStitchInput = false;
        }

        this.mode.updateInput(nextInput);
        (this as unknown as { userInput: string }).userInput = nextInput;
        this.otherInputCache = nextInput;
        try {
          const parsed = this.parseInput(nextInput);
          this.setCommittedValue(parsed ?? this.getDefaultValue());
        } catch {
          // If parsing fails, keep the current value but still update display
          // The validation will catch this
        }
      } else {
        this.shouldStitchInput = false;
      }
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // Clear error state when user types (like base Prompt class does)
      this.clearErrorState();

      // Delegate Tab and toolbar navigation to the shared handler
      if (this.handleToolbarKey(char, info)) {
        return;
      }

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      // If both current and default are undefined, we're in text-only mode
      if (!this.hasPresetOptions()) {
        // Already in typing mode, just update the value as the user types
        if (this.mode.isInInteraction("typing")) {
          try {
            const parsed = this.parseInput(this.userInput);
            this.setCommittedValue(parsed ?? this.getDefaultValue());
          } catch {
            // Keep current value if parsing fails
          }
        }
        return;
      }

      // If any printable character is pressed and we're not already typing,
      // jump to the text input option and start typing
      if (
        char &&
        char.length === 1 &&
        !info.ctrl &&
        !info.meta &&
        !this.mode.isInInteraction("typing")
      ) {
        const isArrowKey = ["up", "down", "left", "right"].includes(
          info.name || "",
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || "",
        );

        if (!isArrowKey && !isControlKey) {
          // Calculate the text input index dynamically
          const textInputIndex = this.getTextInputIndex();

          this.mode.setCursor(textInputIndex); // Jump to the "Other" option
          const existingInput =
            this.mode.getInputValue() ||
            this.userInput ||
            this.otherInputCache ||
            "";

          this.mode.enterTyping(existingInput);

          const nextInput = `${existingInput}${char}`;
          this.otherInputCache = nextInput;
          this._setUserInput(nextInput);
          this.mode.updateInput(nextInput);
          this.syncCursorToInputEnd();
          this.updateValue();
          return;
        }
      }

      // Calculate the text input index dynamically
      const textInputIndex = this.getTextInputIndex();

      if (this.mode.getCursor() === textInputIndex) {
        // Text input option
        if (info.name === "escape") {
          // Exit typing mode
          this.mode.exitTyping();
          this._clearUserInput(); // Clear the internal readline state
          this.mode.clearInput();
          this.otherInputCache = "";
          this.updateValue();
          return; // Prevent default Escape behavior
        }
      }
    });
  }

  private getInputDisplay(includeCursor: boolean): string {
    const inputValue = this.mode.getInputValue();
    if (!includeCursor) {
      return inputValue;
    }

    const rawCursor = this.mode.isInInteraction("typing")
      ? Math.max(
          0,
          (this as unknown as { _cursor?: number })._cursor ??
            inputValue.length,
        )
      : 0;
    const cursorIndex = Math.min(rawCursor, inputValue.length);

    if (cursorIndex >= inputValue.length) {
      return `${inputValue}${S_CURSOR}`;
    }

    const before = inputValue.slice(0, cursorIndex);
    const cursorChar = inputValue.charAt(cursorIndex) || " ";
    const after = inputValue.slice(cursorIndex + 1);

    return `${before}${this.colors.inverse(cursorChar)}${after}`;
  }

  private syncCursorToInputEnd(): void {
    const cursorHost = this as unknown as { _cursor?: number };
    cursorHost._cursor = this.mode.getInputValue().length;
  }

  protected override toggleSecretReveal(): void {
    const cachedInput =
      this.mode.getInputValue() || this.userInput || this.otherInputCache;

    super.toggleSecretReveal();

    if (!cachedInput) {
      return;
    }

    this.shouldStitchInput = Boolean(this.otherInputCache || cachedInput);
    const stitchedBaseline = cachedInput;

    queueMicrotask(() => {
      const restored = this.otherInputCache || stitchedBaseline;
      if (!restored) {
        return;
      }

      if (!this.mode.isInInteraction("typing")) {
        this.mode.enterTyping(restored);
      }

      this.isRestoringInput = true;
      this.internals.track = true;
      this.mode.updateInput(restored);
      this.otherInputCache = restored;
      this._setUserInput(restored, true);
      this.syncCursorToInputEnd();
    });
  }

  private updateValue() {
    if (!this.hasPresetOptions()) {
      try {
        const parsed = this.parseInput(this.mode.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
      return;
    }

    if (!this.mode.isInInteraction("typing")) {
      const options = this.buildSelectionOptions();
      const selected = options[this.mode.getCursor()];

      if (!selected) {
        this.setCommittedValue(this.getDefaultValue());
        return;
      }

      if (selected.type === "value") {
        if (selected.invalid) {
          this.setCommittedValue(this.getDefaultValue());
          return;
        }
        this.setCommittedValue(selected.value ?? this.getDefaultValue());
        return;
      }

      this.setCommittedValue(this.getDefaultValue());
    } else {
      try {
        const parsed = this.parseInput(this.mode.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
    }
  }

  protected formatValue(value: number | undefined): string {
    const str = value !== undefined ? value.toString() : "";
    return this.truncateValue(str);
  }

  protected parseInput(input: string): number | undefined {
    if (!input || !input.trim()) {
      return undefined;
    }

    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return undefined;
    }

    return parsed;
  }

  protected validateInput(input: string): string | undefined {
    if (!input || !input.trim()) {
      return "Please enter a number";
    }

    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return "Please enter a valid number";
    }

    return undefined;
  }

  protected getDefaultValue(): number {
    return 0;
  }

  private hasPresetOptions(): boolean {
    return (
      this.currentResult?.rawValue !== undefined || this.default !== undefined
    );
  }

  private buildValueOptions(): SelectableOption<number>[] {
    const hasValidCurrent =
      this.currentResult?.isValid !== false && this.current !== undefined;

    const baseOptions: SelectableOption<number>[] = [];

    if (hasValidCurrent && this.current !== undefined) {
      const isSameAsDefault = this.current === this.default;
      baseOptions.push({
        key: "current",
        value: this.current,
        display: this.formatValue(this.current),
        annotation:
          this.buildAnnotation({
            isCurrent: true,
            isDefault: isSameAsDefault,
          }) ?? undefined,
      });
    }

    const shouldIncludeDefault =
      this.default !== undefined &&
      (!hasValidCurrent || this.current !== this.default);

    if (shouldIncludeDefault && this.default !== undefined) {
      const isSameAsCurrent = hasValidCurrent && this.current === this.default;
      baseOptions.push({
        key: "default",
        value: this.default,
        display: this.formatValue(this.default),
        annotation:
          this.buildAnnotation({
            isDefault: true,
            isCurrent: isSameAsCurrent,
          }) ?? undefined,
      });
    }

    return buildSelectableOptions<number>({
      currentResult: this.currentResult,
      formatInvalidDisplay: (raw) => this.formatRawValue(raw ?? ""),
      buildAnnotation: (flags) => this.buildAnnotation(flags) ?? undefined,
      baseOptions,
      invalidOptionKey: "current",
    });
  }

  private buildSelectionOptions(): NumberPromptOption[] {
    const valueOptions = this.buildValueOptions();

    const options: NumberPromptOption[] = valueOptions.map((option) => ({
      type: "value",
      key: option.key as "current" | "default",
      value: option.value,
      display: option.display,
      annotation: option.annotation,
      invalid: option.invalid,
    }));

    options.push({ type: "other", label: "Other" });

    return options;
  }

  private getSelectedOption(): NumberPromptOption | undefined {
    if (!this.hasPresetOptions()) {
      return undefined;
    }

    const options = this.buildSelectionOptions();
    return options[this.mode.getCursor()];
  }

  private formatRawValue(raw: string): string {
    if (!raw) {
      return "";
    }
    return this.truncateValue(raw);
  }

  private getTextInputIndex(): number {
    if (!this.hasPresetOptions()) {
      return 0;
    }

    const options = this.buildSelectionOptions();
    const index = options.findIndex(
      (option: NumberPromptOption) => option.type === "other",
    );
    return index === -1 ? options.length - 1 : index;
  }
}
