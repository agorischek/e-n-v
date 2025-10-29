<!-- markdownlint-disable-next-line -->
<img src="./assets/repo-logo.png" alt="e-n-v Logo" height="55"/>

> "Environments, niftily? Very!"

e·n·v is a suite of nifty stuff for working with environment variables and `.env` files.

## Getting Started

See [`@e-n-v/env`](./packages/env/README.md).

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
