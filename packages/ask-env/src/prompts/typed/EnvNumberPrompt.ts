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

        // If both current and default are undefined, show only text input
        if (this.current === undefined && this.default === undefined) {
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

          // Add validation output or placeholder text with L-shaped pipe
          output += "\n";
          output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

          return output;
        }

        // Create options array dynamically based on what values exist
        const options: Array<
          { value: number | undefined; label: string } | string
        > = [];

        // Add current value if it exists
        if (this.current !== undefined) {
          const annotation = this.getAnnotationLabel(this.current);
          if (annotation) {
            options.push({ value: this.current, label: `(${annotation})` });
          }
        }

        // Add default value if it exists and is different from current
        if (this.default !== undefined && this.current !== this.default) {
          const annotation = this.getAnnotationLabel(this.default);
          if (annotation) {
            options.push({ value: this.default, label: `(${annotation})` });
          }
        }

        // Always add the custom entry option
        options.push("Other");

        options.forEach((option, index) => {
          const isSelected = index === this.mode.getCursor();
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (typeof option === "string") {
            // "Other" option
            if (this.mode.isInInteraction("typing")) {
              const displayText = dimInputs
                ? this.colors.dim(this.getInputDisplay(false))
                : this.colors.white(this.getInputDisplay(true));
              output += `${this.getBar()}  ${circle} ${displayText}\n`;
            } else if (isSelected) {
              if (dimInputs) {
                output += `${this.getBar()}  ${circle} ${this.colors.dim(option)}\n`;
              } else {
                output += `${this.getBar()}  ${circle} ${this.colors.white(this.getInputDisplay(true))}\n`;
              }
            } else {
              // "Other" is gray when not selected
              const text = dimInputs
                ? this.colors.dim(option)
                : this.colors.subtle(option);
              output += `${this.getBar()}  ${circle} ${text}\n`;
            }
          } else {
            // Current/Default options
            const displayValue = this.formatValue(option.value);
            const text = dimInputs
              ? this.colors.dim(displayValue)
              : isSelected
                ? this.colors.white(displayValue)
                : this.colors.subtle(displayValue);
            const annotation = ` ${option.label}`;
            let suffix = "";
            if (isSelected) {
              suffix = dimInputs
                ? this.colors.dim(annotation)
                : this.colors.subtle(annotation);
            }
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
          }
        });

        // Add validation output or placeholder text with L-shaped pipe
        output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

        return output;
      },
      validate: (value: number | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }
        // If both current and default are undefined, we're in text-only mode
        if (this.current === undefined && this.default === undefined) {
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
          const validation = this.runSchemaValidation(value?.toString());
          if (!validation.success) {
            return validation.error;
          }
        }

        // All other cases are valid
        return undefined;
      },
    } as any);

    // If both current and default are undefined, start in typing mode
    if (this.current === undefined && this.default === undefined) {
      this.mode.enterTyping();
      this.mode.clearInput();
      this._setUserInput("");
      this.otherInputCache = "";
      this.setCommittedValue(this.getDefaultValue());
    } else {
      // Set initial value based on cursor position
      this.updateValue();
    }

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // If both current and default are undefined, we're in text-only mode - no cursor navigation
      if (this.current === undefined && this.default === undefined) {
        return;
      }

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      switch (action) {
        case "up":
          // Calculate max index based on actual options
          let optionsCount = 0;
          if (this.current !== undefined) optionsCount++;
          if (this.default !== undefined && this.current !== this.default)
            optionsCount++;
          optionsCount++; // For "Other" option
          const maxIndex = optionsCount - 1;

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
          let optionsCountDown = 0;
          if (this.current !== undefined) optionsCountDown++;
          if (this.default !== undefined && this.current !== this.default)
            optionsCountDown++;
          optionsCountDown++; // For "Other" option
          const maxIndexDown = optionsCountDown - 1;

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
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

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
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // Delegate Tab and toolbar navigation to the shared handler
      if (this.handleToolbarKey(char, info)) {
        return;
      }

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      // If both current and default are undefined, we're in text-only mode
      if (this.current === undefined && this.default === undefined) {
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
    // If both current and default are undefined, we're in text-only mode
    if (this.current === undefined && this.default === undefined) {
      try {
        const parsed = this.parseInput(this.mode.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
      return;
    }

    if (!this.mode.isInInteraction("typing")) {
      // Dynamically determine what option the cursor is on
      let optionIndex = 0;

      // Check if cursor is on current value
      if (this.current !== undefined && this.mode.getCursor() === optionIndex) {
        this.setCommittedValue(this.current);
        return;
      }
      if (this.current !== undefined) optionIndex++;

      // Check if cursor is on default value (and it's different from current)
      if (
        this.default !== undefined &&
        this.current !== this.default &&
        this.mode.getCursor() === optionIndex
      ) {
        this.setCommittedValue(this.default);
        return;
      }
      if (this.default !== undefined && this.current !== this.default)
        optionIndex++;

      // If we get here, cursor is on "Other" option
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

  private getTextInputIndex(): number {
    let index = 0;
    if (this.current !== undefined) index++;
    if (this.default !== undefined && this.current !== this.default) index++;
    return index;
  }
}
