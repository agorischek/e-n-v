# envrw

`envrw` is a tiny utility for reading and updating `.env` files without a full parser. It walks the file from the bottom up so the most recent assignment of a variable always wins.

## Installation

```bash
bun add envrw
```

## Usage

```ts
import EnvVarSource from "envrw";

const source = new EnvVarSource(".env");

const all = await source.read();
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

const name = await source.read("APPNAME");
// → "envrw-dev"

const selection = await source.read(["APPNAME", "URL"]);
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

await source.write("APPNAME", "envrw-prod");
await source.write({ URL: "https://prod.example" });
```

### Behavior

- Reads scan the file from the end toward the top and short-circuit once they find the requested variable(s).
- Writes replace the last occurrence of each variable in-place; if a variable does not exist, it is appended to the end of the file.
- Values containing whitespace, quotes, backslashes, or comment markers are automatically wrapped in double quotes and escaped.
- Files are always written with a trailing newline for POSIX friendliness.

### Notes

- The API is intentionally tiny—there are no configuration options, expansion rules, or comment preservation.
- The class accepts either relative or absolute paths. Relative paths resolve from the current working directory at runtime.
