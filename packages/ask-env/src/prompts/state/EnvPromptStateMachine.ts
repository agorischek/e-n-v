import type { 
  EnvPromptSubstate, 
  EnvPromptState, 
  InteractionMode, 
  IntentionState, 
  SecretVisibility, 
  ValidationState 
} from "./EnvPromptSubstate";
import { createState } from "./EnvPromptSubstate";

/**
 * State machine for managing EnvPrompt state transitions
 */
export class EnvPromptStateMachine {
  private _substate: EnvPromptSubstate;
  private _listeners: Array<(state: EnvPromptState) => void> = [];

  constructor(initialSubstate: EnvPromptSubstate) {
    this._substate = { ...initialSubstate };
  }

  /**
   * Get current complete state
   */
  get state(): EnvPromptState {
    return createState(this._substate);
  }

  /**
   * Get current substate (without computed properties)
   */
  get substate(): EnvPromptSubstate {
    return { ...this._substate };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: EnvPromptState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const currentState = this.state;
    this._listeners.forEach(listener => listener(currentState));
  }

  /**
   * Update substate and notify listeners
   */
  private updateSubstate(updates: Partial<EnvPromptSubstate>): void {
    this._substate = { ...this._substate, ...updates };
    this.notifyListeners();
  }

  // Mode transitions

  /**
   * Enter typing mode from selection mode
   */
  enterTypingMode(inputValue: string = ""): void {
    if (this._substate.mode === "selection") {
      this.updateSubstate({ 
        mode: "typing", 
        inputValue,
        validation: "pending" 
      });
    }
  }

  /**
   * Exit typing mode back to selection mode
   */
  exitTypingMode(): void {
    if (this._substate.mode === "typing") {
      this.updateSubstate({ 
        mode: "selection", 
        inputValue: "",
        validation: "pending" 
      });
    }
  }

  /**
   * Open toolbar (from any mode)
   */
  openToolbar(): void {
    this.updateSubstate({ 
      toolbarOpen: true,
      validation: "suppressed" 
    });
  }

  /**
   * Close toolbar (return to previous mode)
   */
  closeToolbar(): void {
    this.updateSubstate({ 
      toolbarOpen: false,
      validation: "pending" 
    });
  }

  // Cursor movement

  /**
   * Move cursor up/down in selection mode
   */
  moveCursor(direction: "up" | "down", maxIndex: number): void {
    if (this._substate.mode === "selection" && !this._substate.toolbarOpen) {
      const delta = direction === "up" ? -1 : 1;
      let newCursor = this._substate.cursor + delta;
      
      // Wrap around
      if (newCursor < 0) {
        newCursor = maxIndex;
      } else if (newCursor > maxIndex) {
        newCursor = 0;
      }

      this.updateSubstate({ 
        cursor: newCursor,
        validation: "pending" 
      });
    }
  }

  /**
   * Set cursor to specific position
   */
  setCursor(position: number): void {
    if (this._substate.mode === "selection") {
      this.updateSubstate({ 
        cursor: position,
        validation: "pending" 
      });
    }
  }

  // Intention changes

  /**
   * Set user intention (commit, skip, previous)
   */
  setIntention(intention: IntentionState): void {
    this.updateSubstate({ intention });
  }

  // Secret visibility

  /**
   * Toggle secret visibility
   */
  toggleSecretVisibility(): void {
    if (this._substate.secretVisibility !== "not-secret") {
      const newVisibility: SecretVisibility = 
        this._substate.secretVisibility === "hidden" ? "revealed" : "hidden";
      
      this.updateSubstate({ 
        secretVisibility: newVisibility,
        validation: "suppressed" 
      });
    }
  }

  /**
   * Reset secret to hidden state
   */
  resetSecretVisibility(): void {
    if (this._substate.secretVisibility === "revealed") {
      this.updateSubstate({ secretVisibility: "hidden" });
    }
  }

  // Validation state

  /**
   * Set validation state
   */
  setValidationState(validation: ValidationState): void {
    this.updateSubstate({ validation });
  }

  /**
   * Suppress validation temporarily (for toolbar actions)
   */
  suppressValidation(): void {
    this.updateSubstate({ validation: "suppressed" });
  }

  /**
   * Restore validation to pending state
   */
  restoreValidation(): void {
    if (this._substate.validation === "suppressed") {
      this.updateSubstate({ validation: "pending" });
    }
  }

  // Input handling

  /**
   * Update input value (in typing mode)
   */
  updateInput(value: string): void {
    if (this._substate.mode === "typing") {
      this.updateSubstate({ 
        inputValue: value,
        validation: "pending" 
      });
    }
  }

  /**
   * Clear input value
   */
  clearInput(): void {
    this.updateSubstate({ 
      inputValue: "",
      validation: "pending" 
    });
  }

  // Query methods

  /**
   * Check if currently in a specific mode
   */
  isInMode(mode: InteractionMode): boolean {
    return this._substate.mode === mode;
  }

  /**
   * Check if can transition to a specific mode
   */
  canTransitionTo(mode: InteractionMode): boolean {
    switch (mode) {
      case "typing":
        return this._substate.mode === "selection" && !this._substate.toolbarOpen;
      case "selection":
        return this._substate.mode === "typing";
      case "toolbar":
        return !this._substate.toolbarOpen;
      default:
        return false;
    }
  }

  /**
   * Check if submission should be prevented
   */
  shouldPreventSubmission(): boolean {
    const state = this.state;
    return !state.canSubmit || state.shouldConsumeSubmit;
  }

  /**
   * Check if toolbar is currently open
   */
  isToolbarOpen(): boolean {
    return this._substate.toolbarOpen;
  }

  /**
   * Check if secret is revealed
   */
  isSecretRevealed(): boolean {
    return this._substate.secretVisibility === "revealed";
  }

  /**
   * Check if field has secret capability
   */
  hasSecret(): boolean {
    return this._substate.secretVisibility !== "not-secret";
  }

  /**
   * Get current cursor position
   */
  getCursor(): number {
    return this._substate.cursor;
  }

  /**
   * Get current input value
   */
  getInputValue(): string {
    return this._substate.inputValue;
  }

  /**
   * Get current intention
   */
  getIntention(): IntentionState {
    return this._substate.intention;
  }
}