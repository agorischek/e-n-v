import { ZodV3Converter } from "./converters/zod/ZodV3Converter";
import { ZodV4Converter } from "./converters/zod/ZodV4Converter";
import { JoiConverter } from "./converters/joi/JoiConverter";
import type { SchemaConverter } from "./converters/SchemaConverter";

/**
 * Registry of available schema converters
 */
export const converters: SchemaConverter[] = [
  new ZodV4Converter(),
  new ZodV3Converter(),
  new JoiConverter(),
];
