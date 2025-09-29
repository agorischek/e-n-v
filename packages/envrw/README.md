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
```

All methods are asynchronous. `write` performs surgical, in-place updates to preserve surrounding formatting, comments, and ordering whenever possible.

## Development

Install dependencies and run the test suite:

```bash
bun install
bun test
```
