# envrw

Lightweight `.env` file reader/writer built on top of [Chevrotain](https://chevrotain.io/) for safe, non-destructive updates.

## Installation

```bash
bun install envrw
```

## Usage

```ts
import { EnvSource } from "envrw";

const source = new EnvSource(".env");

// Read everything as an object
const all = await source.read();

// Read a single value
const name = await source.read("APPNAME");

// Read multiple values at once
const subset = await source.read(["APPNAME", "URL"]);

// Update a single key without reformatting the file
await source.write("APPNAME", "demo-app");

// Batch update several keys
await source.write({
  APPNAME: "demo-app",
  URL: "https://example.com",
});

// Subscribe to changes for the entire file
const stopAll = await source.listen(() => {
  console.log(".env changed");
});

// Subscribe to a specific key
const stopDebug = await source.listen("DEBUG", (value) => {
  console.log("DEBUG updated to", value);
});

// Later, stop listening
await stopAll();
await stopDebug();
```

All methods are asynchronous. `write` performs surgical, in-place updates to preserve surrounding formatting, comments, and ordering whenever possible.

## Formatting `.env` files

Need to normalize existing files? The formatter removes duplicate keys, preserves section comments, and applies consistent quoting rules.

```ts
import { formatEnvContent, formatEnvFile, EnvSource } from "envrw";

// Format in-memory content
const input = `FOO=one\nFOO=two\nAPP_NAME=demo app`;
const output = formatEnvContent(input);
// -> APP_NAME="demo app"\nFOO=two\n

// Format a file on disk (no-op when already formatted)
await formatEnvFile(".env");

// Or format via EnvSource
const source = new EnvSource(".env");
await source.format();
```

## Development

Install dependencies and run the test suite:

```bash
bun install
bun test
```
