/**
 * Represents the internal state of an environment prompt
 */
export type PromptState =
  | "selecting" // User is navigating between options (current/default/custom)
  | "typing" // User is actively typing input
  | "revealing" // User toggled secret reveal (stays in previous mode but skips validation)
  | "toolbar" // User has opened the toolbar for actions
  | "submitting" // User submitted with valid input
  | "cancelled" // User cancelled the prompt
  | "error"; // Validation error occurred

export interface PromptStateContext {
  // Navigation state
  cursor: number;

  // Input state
  inputValue: string;

  // Secret state
  secretRevealed: boolean;

  // Validation state
  skipNextValidation: boolean;

  // Outcome state
  allowSubmitFromToolbar: boolean;
}

export class PromptStateMachine {
  private _state: PromptState = "selecting";
  private _context: PromptStateContext = {
    cursor: 0,
    inputValue: "",
    secretRevealed: false,
    skipNextValidation: false,
    allowSubmitFromToolbar: false,
  };

  get state(): PromptState {
    return this._state;
  }

  get context(): Readonly<PromptStateContext> {
    return this._context;
  }

  /**
   * Transition to typing mode
   */
  startTyping(): void {
    if (this._state === "selecting" || this._state === "error") {
      this._state = "typing";
    }
  }

  /**
   * Exit typing mode and return to selection
   */
  stopTyping(): void {
    if (this._state === "typing") {
      this._state = "selecting";
      this._context.inputValue = "";
    }
  }

  /**
   * Toggle secret reveal (preserves current mode but sets skip validation)
   */
  toggleSecretReveal(): void {
    if (this._state !== "cancelled" && this._state !== "submitting") {
      this._context.secretRevealed = !this._context.secretRevealed;
      this._context.skipNextValidation = true;
      // Note: state stays the same (revealing is a modifier, not a state)
    }
  }

  /**
   * Open toolbar
   */
  openToolbar(): void {
    if (
      this._state === "selecting" ||
      this._state === "typing" ||
      this._state === "error"
    ) {
      this._state = "toolbar";
    }
  }

  /**
   * Close toolbar and return to previous state
   */
  closeToolbar(): void {
    if (this._state === "toolbar") {
      // Return to selecting by default
      this._state = "selecting";
    }
  }

  /**
   * Move to error state
   */
  setError(): void {
    if (this._state !== "cancelled" && this._state !== "submitting") {
      this._state = "error";
    }
  }

  /**
   * Clear error and return to selecting
   */
  clearError(): void {
    if (this._state === "error") {
      this._state = "selecting";
    }
  }

  /**
   * Submit with outcome
   */
  submit(allowFromToolbar: boolean = false): void {
    this._state = "submitting";
    this._context.allowSubmitFromToolbar = allowFromToolbar;
  }

  /**
   * Cancel the prompt
   */
  cancel(): void {
    this._state = "cancelled";
  }

  /**
   * Update cursor position
   */
  setCursor(position: number): void {
    this._context.cursor = position;
  }

  /**
   * Update input value
   */
  setInputValue(value: string): void {
    this._context.inputValue = value;
  }

  /**
   * Reset secret reveal state
   */
  resetSecretReveal(): void {
    this._context.secretRevealed = false;
  }

  /**
   * Consume and clear skip validation flag
   */
  consumeSkipValidation(): boolean {
    const shouldSkip = this._context.skipNextValidation;
    this._context.skipNextValidation = false;
    return shouldSkip;
  }

  /**
   * Reset all state for reuse
   */
  reset(): void {
    this._state = "selecting";
    this._context = {
      cursor: 0,
      inputValue: "",
      secretRevealed: false,
      skipNextValidation: false,
      allowSubmitFromToolbar: false,
    };
  }

  /**
   * Computed state helpers
   */
  get isTyping(): boolean {
    return this._state === "typing";
  }

  get isToolbarOpen(): boolean {
    return this._state === "toolbar";
  }

  get isSecretRevealed(): boolean {
    return this._context.secretRevealed;
  }

  get shouldDimInputs(): boolean {
    return this._state === "toolbar";
  }

  get allowsKeyboardInput(): boolean {
    return (
      this._state === "selecting" ||
      this._state === "typing" ||
      this._state === "error"
    );
  }

  get isFinished(): boolean {
    return this._state === "submitting" || this._state === "cancelled";
  }
}
