export interface JoiSchemaInternals {
  // Internal properties that may be useful as fallbacks
  _type?: string;
  _flags?: {
    default?: unknown;
    description?: string;
    only?: boolean;
    presence?: "required" | "optional" | "forbidden";
    [key: string]: any;
  };
  _valids?: {
    _values?: Set<unknown>;
    [key: string]: any;
  };
  type?: string; // This is actually a public property
}
