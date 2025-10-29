import { resolveSchema } from "@e-n-v/models";
import {
  string,
  number,
  boolean as booleanStruct,
  optional,
  defaulted,
  enums,
} from "superstruct";

/**
 * Demonstrates converting Superstruct definitions into envcredible schemas.
 */
const schemas = {
  NODE_ENV: enums(["development", "production", "test"] as const),
  PORT: defaulted(number(), 3000),
  DEBUG: defaulted(booleanStruct(), false),
  API_KEY: optional(string()),
};

type SchemaMap = typeof schemas;

const sampleValues: Record<keyof SchemaMap, string | undefined> = {
  NODE_ENV: "production",
  PORT: "8080",
  DEBUG: "true",
  API_KEY: undefined,
};

console.log("🚀 Superstruct Converter Demo\n");

for (const [key, struct] of Object.entries(schemas) as [
  keyof SchemaMap,
  SchemaMap[keyof SchemaMap],
][]) {
  const envSchema = resolveSchema(struct);

  console.log(`${key}`);
  console.log(`  • type: ${envSchema.type}`);
  console.log(`  • required: ${envSchema.required}`);
  console.log(`  • default: ${envSchema.default ?? "<none>"}`);
  console.log(`  • description: ${envSchema.description ?? "<none>"}`);

  if (envSchema.type === "enum") {
    console.log(
      `  • values: ${(envSchema as any).values?.join(", ") ?? "<none>"}`,
    );
  }

  const sample = sampleValues[key];
  if (sample !== undefined) {
    console.log(`  • process("${sample}") → ${envSchema.process(sample)}`);
  }

  console.log();
}

console.log("Error Handling\n--------------");

try {
  resolveSchema(number()).process("not-a-number");
} catch (error) {
  console.log(`• Invalid number: ${String(error)}`);
}

try {
  const enumSchema = resolveSchema(
    enums(["development", "production"] as const),
  );
  enumSchema.process("invalid-env");
} catch (error) {
  console.log(`• Invalid enum: ${String(error)}`);
}

try {
  resolveSchema(booleanStruct()).process("maybe");
} catch (error) {
  console.log(`• Invalid boolean: ${String(error)}`);
}
