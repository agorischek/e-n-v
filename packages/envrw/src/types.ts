export type EnvRecord = Record<string, string>;

export type EnvSelectionRecord<T extends readonly string[]> = {
  [K in T[number]]: string | undefined;
};

export type EnvPrimitiveValue = string | number | boolean | bigint;

export type AssignmentStyle = {
  leading?: string;
  exportPrefix?: string;
  trailing?: string;
};

export type ParsedAssignment = {
  key: string;
  value: string;
  startIndex: number;
  endIndex: number;
  leading: string;
  exportPrefix: string;
  trailing: string;
  lines: string[];
};
