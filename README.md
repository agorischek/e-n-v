# ask-env

Interactive CLI tool to generate `.env` files with Zod schema validation. Prompts users for environment variables, validates input using Zod schemas, and writes the validated values to a `.env` file.

## Features

- 🔧 Interactive CLI prompts using [@clack/prompts](https://github.com/natemoo-re/clack)
- ✅ Input validation with [Zod](https://github.com/colinhacks/zod) schemas
- 📁 Automatic `.env` file generation
- 🎯 TypeScript support with full type safety
- 🧪 Comprehensive test suite with Bun
- 🎨 Smart placeholder generation based on schema types

## Installation

```bash
npm install ask-env
# or
yarn add ask-env
# or
pnpm add ask-env
# or
bun add ask-env
```

## Quick Start

```typescript
import { z } from 'zod';
import { askEnv } from 'ask-env';

const schemas = {
  DB_HOST: z.string().min(1, 'Database host is required'),
  DB_PORT: z.string().regex(/^\d+$/, 'Must be a valid port number'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_LOGGING: z.string().transform(val => val.toLowerCase() === 'true'),
};

// Run the interactive prompt
await askEnv(schemas);
```

This will:
1. Show an interactive prompt for each environment variable
2. Validate input according to your Zod schemas
3. Re-prompt on validation errors with helpful error messages
4. Write the validated values to `.env`

## API

### `askEnv(schemas, options?)`

**Parameters:**

- `schemas`: `Record<string, z.ZodSchema>` - Object mapping environment variable names to Zod schemas
- `options?`: `AskEnvOptions` - Optional configuration

**Options:**

```typescript
interface AskEnvOptions {
  envPath?: string;    // Path to .env file (default: '.env')
  overwrite?: boolean; // Whether to overwrite existing file without prompting (default: false)
}
```

## Examples

### Basic Usage

```typescript
import { z } from 'zod';
import { askEnv } from 'ask-env';

const schemas = {
  API_KEY: z.string().min(1),
  PORT: z.string().regex(/^\d+$/),
  DEBUG: z.string().transform(val => val === 'true'),
};

await askEnv(schemas);
```

### Advanced Validation

```typescript
const schemas = {
  // String with minimum length
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // URL validation
  API_BASE_URL: z.string().url('Must be a valid URL'),
  
  // Enum values
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Number validation with transformation
  DB_PORT: z.string()
    .regex(/^\d+$/, 'Must be a number')
    .transform(Number)
    .refine(port => port > 0 && port <= 65535, 'Port must be between 1 and 65535'),
  
  // Optional fields
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  
  // Default values
  ENABLE_CORS: z.string().default('true'),
};

await askEnv(schemas, { 
  envPath: './config/.env',
  overwrite: true 
});
```

### Custom Output Path

```typescript
await askEnv(schemas, { 
  envPath: './config/production.env' 
});
```

## Schema Types & Placeholders

The library automatically generates helpful placeholder text based on your Zod schema types:

- `z.string()` → "Enter a string value"
- `z.number()` → "Enter a number" 
- `z.boolean()` → "true or false"
- `z.enum(['a', 'b'])` → "One of: a, b"
- `z.string().optional()` → "Enter a string value (optional)"
- `z.string().default('val')` → "Default: val"

## Error Handling

When validation fails, the library displays clear error messages and re-prompts for input:

```
✔ Enter value for DB_HOST: localhost
✖ Enter value for DB_PORT: invalid
  Must be a valid port number
✔ Enter value for DB_PORT: 5432
```

## Development

### Setup

```bash
git clone <repository>
cd ask-env
bun install
```

### Scripts

```bash
# Build the library
bun run build

# Run tests
bun test

# Run example
bun run example.ts
```

### Testing

The library includes comprehensive tests using Bun's built-in test runner:

```bash
bun test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.