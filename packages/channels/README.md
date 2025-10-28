<!-- markdownlint-disable-next-line -->
<img src="../../assets/env4.png" alt="e-n-v Logo" height="35"/>

# e·n·v channels

Channel abstraction for reading and writing environment variables from different sources.

## Overview

The channels package provides a unified interface (`EnvChannel`) for accessing environment variables from various sources like `.env` files, `process.env`, and dotenvx. This abstraction allows other e·n·v packages to work seamlessly with different environment variable storage mechanisms.

## Installation

```bash
npm install @e-n-v/channels
# or
bun add @e-n-v/channels
```

## Quick Start

```typescript
import { resolveChannel } from "@e-n-v/channels";

// Default channel (reads/writes .env files)
const channel = resolveChannel("default");

// Get all environment variables
const vars = await channel.get();
console.log(vars); // { DATABASE_URL: "...", API_KEY: "..." }

// Set environment variables
await channel.set({
  DATABASE_URL: "postgresql://localhost:5432/mydb",
  API_KEY: "sk-1234567890",
});
```

## Available Channels

### Default Channel

Reads and writes `.env` files using the `@e-n-v/files` package.

```typescript
import { resolveChannel } from "@e-n-v/channels";

// Uses .env file in current directory
const channel = resolveChannel("default");

// Or specify a custom path
const channel = resolveChannel({ name: "default", path: ".env.local" });
```

### Process Environment Channel

Reads from and writes to `process.env`.

```typescript
import { resolveChannel } from "@e-n-v/channels";

const channel = resolveChannel("processenv");

// Or with explicit config
const channel = resolveChannel({ process });
```

### DotenvX Channel

Integration with [dotenvx](https://www.npmjs.com/package/@dotenvx/dotenvx) for advanced .env file management.

```typescript
import { resolveChannel } from "@e-n-v/channels";
import dotenvx from "@dotenvx/dotenvx";

const channel = resolveChannel({
  dotenvx,
  get: { /* get options */ },
  set: { /* set options */ },
});
```

## API Reference

### `resolveChannel(options, defaultPath?): EnvChannel`

Creates an `EnvChannel` instance based on the provided options.

**Parameters:**

- `options`: `EnvChannelOptions` - Channel configuration
- `defaultPath`: `string` - Default path for file-based channels (default: `.env`)

**Returns:** `EnvChannel` instance

### `EnvChannel` Interface

```typescript
interface EnvChannel {
  get(): Promise<Record<string, string>>;
  set(values: Record<string, string>): Promise<void>;
}
```

#### `get(): Promise<Record<string, string>>`

Retrieves all environment variables from the channel source.

#### `set(values: Record<string, string>): Promise<void>`

Sets multiple environment variables in the channel source.

## Channel Options

### String Options

- `"default"` - Uses default .env file channel
- `"processenv"` - Uses process.env channel

### Object Options

#### Default Channel Config

```typescript
{
  name: "default",
  path?: string // Path to .env file
}
```

#### Process Environment Config

```typescript
{
  name: "processenv"
}
// or
{
  process: typeof process // Node.js process object
}
```

#### DotenvX Channel Config

```typescript
{
  dotenvx: DotEnvXInstance,
  get?: DotEnvXGetOptions,
  set?: DotEnvXSetOptions
}
```

## Usage with Other Packages

Channels are primarily used by higher-level e·n·v packages:

```typescript
import { prompt } from "@e-n-v/prompt";
import { resolveChannel } from "@e-n-v/channels";
import dotenvx from "@dotenvx/dotenvx";

// Use with prompt
await prompt({
  vars: { API_KEY: z.string() },
  channel: resolveChannel({ dotenvx }),
});
```

## Error Handling

```typescript
try {
  const channel = resolveChannel("invalid-channel");
} catch (error) {
  console.error("Invalid channel options:", error.message);
}
```

## Related Packages

- **[@e-n-v/core](../core)**: Core types and interfaces
- **[@e-n-v/files](../files)**: File-based environment variable management
- **[@e-n-v/prompt](../prompt)**: Uses channels for interactive setup

## License

MIT
