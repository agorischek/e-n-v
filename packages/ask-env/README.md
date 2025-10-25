<!-- markdownlint-disable-next-line -->
<img src="./assets/ask-env-logo.png" alt="Ask Env Logo" height="75"/>

# ask-env

Interactive CLI for creating and editing `.env` files.

```ts
import { ask, schemas } from "ask-env";

const { NODE_ENV, PORT, OPENAI_API_KEY } = schemas;

await ask({ NODE_ENV, PORT, OPENAI_API_KEY });
```

## Schemas

Environment variable schemas can be supplied in three ways:

- Built-in schemas, such as `NODE_ENV`/`nodeEnv()`
- Custom Zod schemas, such as `z.string().min(3)`
- Built-in schema utilities, such as `s.string({ default: "debug" })`

## Channels

By default, values are written directly to the specified file path via [`envrw`](../envrw/README.md). Alternatively, values can be managed via [`dotenvx`](https://www.npmjs.com/package/@dotenvx/dotenvx):

```ts
await ask({ OPENAI_API_KEY }, { channel: { dotenvx } });
```

## Options

```typescript
await ask(vars, {
  path: "./config/.env.local",
  root: import.meta.url,
  truncate: 60,
  secrets: ["PAYMENT_SECRET"],
  preprocess: { number: (value) => value.replace(/_/g, "") },
});
```

- `root`: resolve relative `path` values next to the caller (default: `process.cwd()`)
- `path`: override the `.env` file location (default: `.env`)
- `channel`: choose how values are read and written
- `truncate`: clamp long values in the UI (default: `40` characters)
- `secrets`: add or replace the masking patterns (default covers passwords, tokens, URLs, etc.)
- `preprocess`: override built-in preprocessors from `@envcredible/core` before validation (default uses built-in processors)
- `theme`: provide a `picocolors` formatter (default: `magenta`)
