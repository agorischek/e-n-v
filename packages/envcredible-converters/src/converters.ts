import { ZodV3Converter } from "./converters/ZodV3Converter";
import { ZodV4Converter } from "./converters/ZodV4Converter";
import { JoiConverter } from "./converters/JoiConverter";
import type { SchemaConverter } from "./SchemaConverter";

/**
 * Registry of available schema converters
 */
export const converters: SchemaConverter[] = [
  new ZodV4Converter(),
  new ZodV3Converter(),
  new JoiConverter()
];