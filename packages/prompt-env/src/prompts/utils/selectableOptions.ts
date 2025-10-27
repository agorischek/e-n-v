import type { ProcessingResult } from "../processing/processValue";

export type SelectableOption<T> = {
  key: string;
  value: T | undefined;
  display: string;
  annotation?: string;
  invalid?: boolean;
};

export type BuildSelectableOptionsParams<T> = {
  baseOptions: ReadonlyArray<SelectableOption<T>>;
  currentResult?: ProcessingResult<T>;
  formatInvalidDisplay: (raw: string | undefined) => string;
  buildAnnotation: (flags: {
    isCurrent?: boolean;
    isDefault?: boolean;
    invalid?: boolean;
  }) => string | undefined;
  invalidOptionKey?: string;
};

export function buildSelectableOptions<T>(
  params: BuildSelectableOptionsParams<T>,
): SelectableOption<T>[] {
  const invalidOptionKey = params.invalidOptionKey ?? "invalid";
  const baseOptions = params.baseOptions.map((option) => ({ ...option }));

  const currentRaw = params.currentResult?.rawValue;
  const isInvalidCurrent =
    currentRaw !== undefined && params.currentResult?.isValid === false;

  if (!isInvalidCurrent) {
    return baseOptions;
  }

  const invalidDisplay = params.formatInvalidDisplay(currentRaw);
  const annotation = params.buildAnnotation({
    isCurrent: true,
    invalid: true,
  });

  const invalidOption: SelectableOption<T> = {
    key: invalidOptionKey,
    value: undefined,
    display: invalidDisplay,
    annotation: annotation ?? undefined,
    invalid: true,
  };

  return [invalidOption, ...baseOptions];
}

export function resolveInitialCursor<T>(
  options: readonly SelectableOption<T>[],
  params: {
    currentValue?: T;
    defaultValue?: T;
    isEqual?: (left: T | undefined, right: T | undefined) => boolean;
  },
): number {
  if (!options.length) {
    return 0;
  }

  const equals = params.isEqual ?? ((left, right) => left === right);

  const findIndexForValue = (value?: T): number => {
    if (value === undefined) {
      return -1;
    }
    return options.findIndex(
      (option) => !option.invalid && equals(option.value, value),
    );
  };

  const currentIndex = findIndexForValue(params.currentValue);
  if (currentIndex >= 0) {
    return currentIndex;
  }

  const defaultIndex = findIndexForValue(params.defaultValue);
  if (defaultIndex >= 0) {
    return defaultIndex;
  }

  const firstValid = options.findIndex((option) => !option.invalid);
  return firstValid >= 0 ? firstValid : 0;
}

export function getOptionAtCursor<T>(
  options: readonly SelectableOption<T>[],
  cursor: number,
): { option?: SelectableOption<T>; index: number } {
  if (!options.length) {
    return { option: undefined, index: 0 };
  }

  const index = Math.max(0, Math.min(cursor, options.length - 1));
  return { option: options[index], index };
}
