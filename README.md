<!-- markdownlint-disable-next-line -->
<img src="./assets/env4.png" alt="e-n-v Logo" height="50"/>

> "Environments, niftily? Very!"

e·n·v is a suite of nifty stuff for working with environment variables and `.env` files.

## Usage

### 1. Define your model

An env model defines the structure of your environment variables, including names, schemas, and any preprocessing (e.g. converting `1`/`0` to boolean). This model is used both for development-time setup and runtime validation. e·n·v provides built-in schemas for common variables, and custom schemas can be authored using Zod.

```ts
// env.model.js

import { define, schemas } from "@e-n-v/env";

const { NODE_ENV, DATABASE_URL, PORT } = schemas;

export default define({
  schemas: { NODE_ENV, DATABASE_URL, PORT },
});
```

### 2. Set up for development

Add a setup script to interactively author your local `.env` file during development. Run this via your typical script runner (e.g. `node`, `tsx`, `bun`). You can also wrap this in a package script, e.g. `npm run env`.

```ts
// env.setup.js

import dotenv from "dotenv";
import { prompt } from "@e-n-v/env";
import model from "./env.model";

await prompt(model, {
  channel: { dotenv },
});
```

### 3. Parse at runtime

In your app, load your environment variables as usual, parse them, and export them for use. A combined error is thrown if any variables fail validation. Reference these exports throughout your code rather than using `process.env` directly.

```ts
// env.vars.js

import "dotenv/config";
import { parse } from "@e-n-v/env";
import model from "./env.model";

export const { NODE_ENV, PORT, DATABASE_URL } = parse(process.env, model);
```

### 4. Customize

e·n·v provides a variety of customization options, including:

1. Authoring custom variable schemas using Zod or built-in schema utilities.
2. Reading and writing variables via other libraries, e.g. `dotenvx`.
3. Changing the setup CLI behavior, such as what variables are treated as secrets.

Happy configuration!

## Packages

e·n·v functionality can be used individually or all together.

### Primary

- **[`@e-n-v/env`](./packages/env/README.md)**: Everything e·n·v has to offer
- **[`@e-n-v/prompt`](./packages/prompt/README.md)**: Interactive `.env` CLI with validation
- **[`@e-n-v/parse`](./packages/parse/README.md)**: Direct environment variable parsing and validation
- **[`@e-n-v/schemas`](./packages/schemas/README.md)**: Zod schemas for common environment variables
- **[`@e-n-v/files`](./packages/files/README.md)**: Read/write API for `.env` files

### Supporting

- **[`@e-n-v/channels`](./packages/channels/README.md)**: Channel abstraction for reading/writing env vars
- **[`@e-n-v/core`](./packages/core/README.md)**: Core types and utilities
- **[`@e-n-v/converters`](./packages/converters/README.md)**: Schema resolution and conversion
- **[`@e-n-v/models`](./packages/models/README.md)**: Environment variable model definitions

# Acknowledgments

This project was directly inspired by [znv](https://www.npmjs.com/package/znv), which I've quite enjoyed using in my projects. It made me think: If we have enough information to validate environment variables at runtime, do we also have enough information to ask developers for them interactively? That exploration turned into this project's `prompt` component. e·n·v supports Zod schemas, so if you're using znv and would like to continue doing so, just factor your schemas out to a variable and submit it to `prompt`.
