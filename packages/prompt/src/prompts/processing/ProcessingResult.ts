export interface ProcessingResult<T> {
  value: T | undefined;
  rawValue?: string;
  isValid: boolean;
  error?: string;
}
