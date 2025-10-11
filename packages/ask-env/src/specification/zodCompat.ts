import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";
import type { EnvVarType } from "./EnvVarType";

export type CompatibleZodSchema = ZodTypeAny | $ZodType;

export type SchemaDef = Record<string, unknown> | undefined;

const OPTIONAL_TAGS = new Set(["ZodOptional", "optional"]);
const NULLABLE_TAGS = new Set(["ZodNullable", "nullable"]);
const DEFAULT_TAGS = new Set(["ZodDefault", "default"]);
const EFFECT_TAGS = new Set(["ZodEffects"]);
const PIPE_TAGS = new Set(["ZodPipeline", "pipe"]);
const CATCH_TAGS = new Set(["ZodCatch", "catch"]);
const READONLY_TAGS = new Set(["ZodReadonly", "readonly"]);
const BRAND_TAGS = new Set(["ZodBranded", "brand"]);
const PREFALT_TAGS = new Set(["ZodPrefault", "prefault"]);
const WRAPPER_TAGS = new Set([
  ...OPTIONAL_TAGS,
  ...NULLABLE_TAGS,
  ...DEFAULT_TAGS,
  ...EFFECT_TAGS,
  ...PIPE_TAGS,
  ...CATCH_TAGS,
  ...READONLY_TAGS,
  ...BRAND_TAGS,
  ...PREFALT_TAGS,
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isZodV4Schema(schema: unknown): schema is $ZodType {
  return Boolean(isRecord(schema) && "_zod" in schema);
}

export function getSchemaDef(schema: CompatibleZodSchema): SchemaDef {
  if (!schema) {
    return undefined;
  }

  if (isZodV4Schema(schema)) {
    const container = schema as unknown;
    if (isRecord(container) && "_zod" in container) {
      const internals = (container as { _zod?: unknown })._zod;
      if (isRecord(internals) && "def" in internals) {
        const def = (internals as { def?: unknown }).def;
        return isRecord(def) ? def : undefined;
      }
    }
    return undefined;
  }

  const legacy = schema as ZodTypeAny & { _def?: unknown };
  const def = legacy._def;
  return isRecord(def) ? def : undefined;
}

export function getDefType(def: SchemaDef): string | undefined {
  if (!def) {
    return undefined;
  }

  const type = (def as { type?: unknown }).type;
  if (typeof type === "string" && type.length > 0) {
    return type;
  }

  const typeName = (def as { typeName?: unknown }).typeName;
  if (typeof typeName === "string" && typeName.length > 0) {
    return typeName;
  }

  return undefined;
}

export function getSchemaDescription(
  schema: CompatibleZodSchema,
  def: SchemaDef
): string | undefined {
  const directDescription = (schema as { description?: unknown }).description;
  if (typeof directDescription === "string" && directDescription.length > 0) {
    return directDescription;
  }

  const defDescription = def && (def as { description?: unknown }).description;
  if (typeof defDescription === "string" && defDescription.length > 0) {
    return defDescription;
  }

  const metaFn = (schema as { meta?: () => unknown }).meta;
  if (typeof metaFn === "function") {
    const meta = metaFn.call(schema);
    if (
      meta &&
      typeof meta === "object" &&
      "description" in meta &&
      typeof (meta as { description?: unknown }).description === "string"
    ) {
      const value = (meta as { description: string }).description.trim();
      if (value.length > 0) {
        return value;
      }
    }
  }

  return undefined;
}

export function getInnerSchema(def: SchemaDef): CompatibleZodSchema | undefined {
  if (!def) {
    return undefined;
  }

  if ("innerType" in def && def.innerType) {
    return def.innerType as CompatibleZodSchema;
  }

  if ("schema" in def && def.schema) {
    return def.schema as CompatibleZodSchema;
  }

  if ("in" in def && def.in) {
    return def.in as CompatibleZodSchema;
  }

  if ("inner" in def && def.inner) {
    return def.inner as CompatibleZodSchema;
  }

  return undefined;
}

export function getDefaultFromDef(def: SchemaDef): unknown {
  if (!def) {
    return undefined;
  }

  if ("defaultValue" in def) {
    const raw = (def as { defaultValue?: unknown }).defaultValue;
    if (typeof raw === "function") {
      try {
        return (raw as () => unknown)();
      } catch {
        return undefined;
      }
    }
    return raw;
  }

  if ("prefaultValue" in def) {
    const raw = (def as { prefaultValue?: unknown }).prefaultValue;
    if (typeof raw === "function") {
      try {
        return (raw as () => unknown)();
      } catch {
        return undefined;
      }
    }
    return raw;
  }

  return undefined;
}

export interface PeeledSchemaResult {
  schema: CompatibleZodSchema;
  required: boolean;
  nullable: boolean;
  defaultValue: unknown;
  description?: string;
}

export function peelSchema(schema: CompatibleZodSchema): PeeledSchemaResult {
  let current = schema;
  let required = true;
  let nullable = false;
  let defaultValue: unknown = undefined;
  let description: string | undefined;

  // Unwrap common wrapper types until we reach a concrete schema.
  // Limit iterations to avoid infinite loops in malformed schemas.
  for (let i = 0; i < 20; i++) {
    const def = getSchemaDef(current);
    if (!def) {
      break;
    }

    if (!description) {
      description = getSchemaDescription(current, def);
    }

    const typeTag = getDefType(def);
    if (!typeTag || !WRAPPER_TAGS.has(typeTag)) {
      break;
    }

    if (OPTIONAL_TAGS.has(typeTag)) {
      required = false;
    }

    if (NULLABLE_TAGS.has(typeTag)) {
      nullable = true;
    }

    if (DEFAULT_TAGS.has(typeTag) || PREFALT_TAGS.has(typeTag)) {
      if (defaultValue === undefined) {
        defaultValue = getDefaultFromDef(def);
      }
    }

    const inner = EFFECT_TAGS.has(typeTag)
      ? (def as { schema?: CompatibleZodSchema }).schema
      : getInnerSchema(def);

    if (!inner) {
      break;
    }

    current = inner;
  }

  return {
    schema: current,
    required,
    nullable,
    defaultValue,
    description,
  };
}

interface CheckInfo {
  tag?: string;
  value?: number;
  minimum?: number;
  maximum?: number;
  inclusive?: boolean;
}

function extractCheckInfo(check: unknown): CheckInfo | undefined {
  if (!check || typeof check !== "object") {
    return undefined;
  }

  const record = check as Record<string, unknown>;
  if (typeof record.kind === "string") {
    return {
      tag: record.kind,
      value: typeof record.value === "number" ? record.value : undefined,
    };
  }

  const zodMeta = (record as { _zod?: { def?: Record<string, unknown> } })._zod;
  if (zodMeta?.def) {
    const metaDef = zodMeta.def;
    return {
      tag: typeof metaDef.check === "string" ? metaDef.check : undefined,
      value: typeof metaDef.value === "number" ? metaDef.value : undefined,
      minimum:
        typeof metaDef.minimum === "number" ? metaDef.minimum : undefined,
      maximum:
        typeof metaDef.maximum === "number" ? metaDef.maximum : undefined,
      inclusive:
        typeof metaDef.inclusive === "boolean" ? metaDef.inclusive : undefined,
    };
  }

  return undefined;
}

export interface RangeConstraints {
  min?: number;
  max?: number;
}

export function extractRangeConstraints(
  schema: CompatibleZodSchema
): RangeConstraints {
  const def = getSchemaDef(schema);
  if (!def || !Array.isArray((def as { checks?: unknown[] }).checks)) {
    return {};
  }

  let min: number | undefined;
  let max: number | undefined;

  for (const check of (def as { checks: unknown[] }).checks) {
    const info = extractCheckInfo(check);
    if (!info) {
      continue;
    }

    const candidateMin = info.minimum ?? info.value;
    const candidateMax = info.maximum ?? info.value;

    if (info.tag) {
      if (
        info.tag === "min" ||
        info.tag === "min_length" ||
        info.tag === "min_value" ||
  info.tag === "greater_than" ||
  info.tag === "greater_than_or_equal"
      ) {
        if (typeof candidateMin === "number") {
          min = candidateMin;
        }
      }

      if (
        info.tag === "max" ||
        info.tag === "max_length" ||
        info.tag === "max_value" ||
        info.tag === "less_than" ||
        info.tag === "less_than_or_equal"
      ) {
        if (typeof candidateMax === "number") {
          max = candidateMax;
        }
      }
    }
  }

  return { min, max };
}

export function extractEnumValues(schema: CompatibleZodSchema): string[] | undefined {
  const def = getSchemaDef(schema);
  if (!def) {
    return undefined;
  }

  if (Array.isArray((def as { values?: unknown[] }).values)) {
    return (def as { values: unknown[] }).values.map((item) => String(item));
  }

  const entries = (def as { entries?: Record<string, unknown> }).entries;
  if (entries && typeof entries === "object") {
    return Object.values(entries).map((item) => String(item));
  }

  return undefined;
}

export function resolveEnvVarType(schema: CompatibleZodSchema): EnvVarType {
  const def = getSchemaDef(schema);
  const typeTag = getDefType(def);

  switch (typeTag) {
    case "string":
    case "ZodString":
      return "string";
    case "number":
    case "ZodNumber":
    case "int":
      return "number";
    case "boolean":
    case "ZodBoolean":
      return "boolean";
    case "enum":
    case "ZodEnum":
      return "enum";
    default:
      break;
  }

  if (def && "values" in def) {
    return "enum";
  }

  return "string";
}
