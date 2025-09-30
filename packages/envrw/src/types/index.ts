export type EnvRecord = Record<string, string>;

export type EnvSelectionRecord<T extends readonly string[]> = {
  [K in T[number]]: string | undefined;
};
