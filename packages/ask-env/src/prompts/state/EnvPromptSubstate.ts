import type { PromptOutcome } from "../../types/PromptOutcome";

/**
 * Primary interaction modes for the prompt
 */
export type InteractionMode = 
  | "selection"     // Navigating predefined options
  | "typing"        // Text input mode  
  | "toolbar";      // Toolbar navigation

/**
 * What the user intends to do when they submit
 */
export type IntentionState = 
  | "commit"        // Submit the current value
  | "skip"          // Skip this prompt
  | "previous";     // Go back to previous prompt

/**
 * Secret visibility for sensitive fields
 */
export type SecretVisibility = 
  | "hidden"        // Secret is masked
  | "revealed"      // Secret is shown
  | "not-secret";   // Field is not a secret

/**
 * Validation state independent of base prompt error state
 */
export type ValidationState = 
  | "pending"       // Not yet validated
  | "valid"         // Passes validation
  | "invalid"       // Has validation errors
  | "suppressed";   // Validation temporarily disabled

/**
 * Complete substate for an EnvPrompt
 */
export interface EnvPromptSubstate {
  readonly mode: InteractionMode;
  readonly intention: IntentionState;
  readonly secretVisibility: SecretVisibility;
  readonly validation: ValidationState;
  readonly cursor: number;
  readonly inputValue: string;
  readonly toolbarOpen: boolean;
  readonly consumeSubmit: boolean;
}

/**
 * Computed properties derived from substate
 */
export interface EnvPromptComputedState {
  readonly canSubmit: boolean;
  readonly shouldTrackInput: boolean;
  readonly shouldDimUI: boolean;
  readonly shouldConsumeSubmit: boolean;
  readonly shouldSkipValidation: boolean;
}

/**
 * Complete state including both core substate and computed properties
 */
export interface EnvPromptState extends EnvPromptSubstate, EnvPromptComputedState {}

/**
 * Creates initial substate for a prompt
 */
export function createInitialSubstate(options: {
  hasSecret: boolean;
  hasOptions: boolean;
  initialInputValue?: string;
}): EnvPromptSubstate {
  return {
    mode: options.hasOptions ? "selection" : "typing",
    intention: "commit",
    secretVisibility: options.hasSecret ? "hidden" : "not-secret",
    validation: "pending",
    cursor: 0,
    inputValue: options.initialInputValue || "",
    toolbarOpen: false,
    consumeSubmit: false,
  };
}

/**
 * Computes derived state from substate
 */
export function computeState(substate: EnvPromptSubstate): EnvPromptComputedState {
  return {
    canSubmit: substate.intention === "commit" && substate.validation !== "invalid",
    shouldTrackInput: substate.mode === "typing",
    shouldDimUI: substate.toolbarOpen,
    shouldConsumeSubmit: substate.consumeSubmit,
    shouldSkipValidation: substate.validation === "suppressed",
  };
}

/**
 * Creates complete state by combining substate and computed properties
 */
export function createState(substate: EnvPromptSubstate): EnvPromptState {
  return {
    ...substate,
    ...computeState(substate),
  };
}