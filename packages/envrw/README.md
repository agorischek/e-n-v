# envrw

A read/write API for `.env` files.

## Installation

```bash
bun add envrw
```

## Usage

```ts
import EnvSource, { source } from "envrw";

const env = source(".env");

const all = await env.read();
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

const name = await env.read("APPNAME");
// → "envrw-dev"

const selection = await env.read(["APPNAME", "URL"]);
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

await env.write("APPNAME", "envrw-prod");
await env.write({ URL: "https://prod.example" });

await env.write("BANNER", "Line one\nLine two\nLine three");
// File now contains:
// BANNER="Line one
// Line two
// Line three"
```

### Behavior

- Reads scan the file from the end toward the top and short-circuit once they find the requested variable(s).
- Writes replace the last occurrence of each variable in-place; if a variable does not exist, it is appended to the end of the file.
- Values containing whitespace, quotes, backslashes, comment markers, or literal newlines are automatically wrapped in double quotes. Real newlines are emitted as-is (no `\n` escaping).
- Files are always written with a trailing newline for POSIX friendliness.

### Convenience factory

- `source(path = ".env")` simply returns a new `EnvSource(path)` if you prefer a terse helper.

### Synchronous helpers

The package also exposes pure helpers for working with `.env` text without touching the filesystem.

- `get(content, key?)` mirrors the async `read` overloads and returns either the full record, a single value, or a selection.
- `set(content, key, value)` / `set(content, record)` returns a new string with the requested updates applied.

```ts
import { get, set } from "envrw";

const text = "FOO=1\nBAR=2\n";
const record = get(text);
// → { FOO: "1", BAR: "2" }

const next = set(text, { BAR: "3", BAZ: "4" });
// → 'FOO=1\nBAR=3\nBAZ=4\n'
```

### Notes

- The API is intentionally tiny—there are no configuration options, expansion rules, or comment preservation.
- The class accepts either relative or absolute paths. Relative paths resolve from the current working directory at runtime.
