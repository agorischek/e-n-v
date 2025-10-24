# EnvPrompt State Management Refactor

## Overview

We've successfully refactored the `EnvPrompt` class to use a centralized state machine instead of scattered state variables. This improves maintainability, reduces complexity, and provides a cleaner mental model for state transitions.

## Before vs After

### Before: Scattered State Variables

```typescript
// Old implementation had these scattered properties:
protected secret: boolean;
protected revealSecret: boolean;
protected allowSubmitFromOption: boolean;
protected consumeNextSubmit: boolean;
protected outcome: PromptOutcome;
private skipValidationFlag: boolean;

// Plus each typed prompt had its own state:
cursor = 0;
isTyping = false;
```

### After: Centralized State Machine

```typescript
// New implementation uses a unified state machine:
protected readonly stateMachine: EnvPromptStateMachine;

// With clear state interface:
interface EnvPromptSubstate {
  readonly mode: InteractionMode;        // "selection" | "typing" | "toolbar"
  readonly intention: IntentionState;    // "commit" | "skip" | "previous"
  readonly secretVisibility: SecretVisibility; // "hidden" | "revealed" | "not-secret"
  readonly validation: ValidationState;  // "pending" | "valid" | "invalid" | "suppressed"
  readonly cursor: number;
  readonly inputValue: string;
  readonly toolbarOpen: boolean;
}
```

## Key Benefits

### 1. **Single Source of Truth**

All prompt-specific state lives in the state machine, eliminating inconsistencies.

### 2. **Explicit State Transitions**

State changes go through named methods like:

- `enterTypingMode()` / `exitTypingMode()`
- `openToolbar()` / `closeToolbar()`
- `setIntention()` / `toggleSecretVisibility()`

### 3. **Computed Properties**

Derived state is calculated, not stored:

```typescript
const state = stateMachine.state;
// These are computed automatically:
state.canSubmit;
state.shouldTrackInput;
state.shouldDimUI;
state.shouldConsumeSubmit;
```

### 4. **Mode-Based Logic**

Behavior changes based on current interaction mode:

- **Selection Mode**: Navigate options with arrow keys
- **Typing Mode**: Accept text input, track cursor
- **Toolbar Mode**: Handle toolbar navigation

### 5. **Testable State Transitions**

State machine can be tested independently of UI rendering.

## State Transition Examples

### Entering Typing Mode

```typescript
// When user types a character in selection mode:
stateMachine.setCursor(textInputIndex);
stateMachine.enterTypingMode(char);
```

### Toolbar Interaction

```typescript
// When user presses Tab:
stateMachine.openToolbar();

// When toolbar action is selected:
stateMachine.suppressValidation(); // For non-submitting actions
// or normal submission for skip/previous
```

### Secret Management

```typescript
// Toggle secret visibility:
stateMachine.toggleSecretVisibility();

// State automatically updates toolbar display:
toolbar.secret = state.secretVisibility === "revealed" ? "shown" : "hidden";
```

## Migration Pattern

### Typed Prompts

Each typed prompt (EnvNumberPrompt, EnvStringPrompt, etc.) no longer needs to manage:

- `cursor` position
- `isTyping` state
- Secret reveal state
- Validation suppression

All of this is handled by the state machine.

### Test Migration

Tests were refactored from checking internal state:

```typescript
// OLD: Checking implementation details
expect(prompt.cursor).toBe(2);
expect(prompt.isTyping).toBe(true);
```

To checking observable behavior:

```typescript
// NEW: Checking behavior
expect(prompt.value).toBe(42);
expect(prompt.userInput).toBe("42");
```

## Toolbar Submit Issue Resolution

The original issue where pressing Enter on toolbar options would submit the prompt has been resolved:

1. **Non-submitting actions** (like toggle secret) suppress validation
2. **Submitting actions** (like skip/previous) set intention and trigger submission
3. **Validation logic** properly handles suppressed state to prevent unwanted submissions

## Future Extensibility

The state machine design makes it easy to:

- Add new interaction modes
- Extend validation states
- Add new intention types
- Debug state transitions
- Test complex flows

## Files Changed

- `/src/prompts/state/EnvPromptSubstate.ts` - Core state interface and utilities
- `/src/prompts/state/EnvPromptStateMachine.ts` - State machine implementation
- `/src/prompts/EnvPrompt.ts` - Refactored to use state machine
- `/src/prompts/typed/EnvNumberPrompt.ts` - Updated to use centralized state
- `/src/prompts/__tests__/EnvNumberPrompt.test.ts` - Behavior-focused tests

## Conclusion

This refactor provides a much cleaner foundation for prompt state management while maintaining all existing functionality. The state machine approach will make future development and debugging significantly easier.
