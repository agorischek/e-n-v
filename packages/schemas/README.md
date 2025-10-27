<!-- markdownlint-disable-next-line -->
<img src="./assets/env-var-schemas-logo2.png" alt="Ask Env Logo" height="50"/>

# e·n·v Schemas

Pre-built, validated schemas for common environment variables with smart defaults and comprehensive validation.

## Overview

The schemas package provides a comprehensive collection of environment variable schemas for common use cases like database connections, API keys, authentication, monitoring, and more. Each schema includes intelligent validation, sensible defaults, and helpful error messages.

## Installation

```bash
npm install @e-n-v/schemas
# or
bun add @e-n-v/schemas
```

## Quick Start

```typescript
import { NODE_ENV, PORT, DATABASE_URL, OPENAI_API_KEY } from "@e-n-v/schemas";
import { define } from "@e-n-v/env";

export default define({
  schemas: {
    NODE_ENV,
    PORT, 
    DATABASE_URL,
    OPENAI_API_KEY,
  },
  preprocess: true,
});
```

## Available Schema Categories

### Common Environment Variables

```typescript
import { NODE_ENV, PORT, LOG_LEVEL } from "@e-n-v/schemas";
```

- `NODE_ENV` - Node.js environment (`development`, `production`, `test`, `staging`)
- `PORT` - Server port (1024-65535, default: 3000)
- `LOG_LEVEL` - Logging level (`error`, `warn`, `info`, `debug`, `trace`)

### Database

```typescript
import { 
  DATABASE_URL, 
  DATABASE_HOST, 
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD
} from "@e-n-v/schemas";
```

- `DATABASE_URL` - Full database connection string (with validation)
- `DATABASE_HOST` - Database hostname
- `DATABASE_PORT` - Database port
- `DATABASE_NAME` - Database name
- `DATABASE_USERNAME` - Database username  
- `DATABASE_PASSWORD` - Database password (marked as secret)
- `DATABASE_SSL` - Enable SSL (boolean)
- `DATABASE_POOL_SIZE` - Connection pool size
- `DATABASE_TIMEOUT` - Connection timeout

### API Services

```typescript
import { API_KEY, API_BASE_URL, API_TIMEOUT } from "@e-n-v/schemas";
```

- `API_KEY` - Generic API key (marked as secret)
- `API_BASE_URL` - API service base URL
- `API_TIMEOUT` - API request timeout in milliseconds

### OpenAI

```typescript
import { 
  OPENAI_API_KEY, 
  OPENAI_ORGANIZATION_ID,
  OPENAI_MODEL 
} from "@e-n-v/schemas";
```

- `OPENAI_API_KEY` - OpenAI API key with format validation
- `OPENAI_ORGANIZATION_ID` - OpenAI organization ID
- `OPENAI_PROJECT_ID` - OpenAI project ID  
- `OPENAI_BASE_URL` - Custom OpenAI API base URL
- `OPENAI_MODEL` - Default model name
- `OPENAI_TIMEOUT` - Request timeout

### Authentication & Security

```typescript
import { JWT_SECRET, SESSION_SECRET, ENCRYPTION_KEY } from "@e-n-v/schemas";
```

- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_ACCESS_TOKEN_EXPIRES_IN` - Access token duration (`15m`, `1h`, etc.)
- `JWT_REFRESH_TOKEN_EXPIRES_IN` - Refresh token duration (`7d`, `30d`, etc.)
- `SESSION_SECRET` - Session cookie secret
- `ENCRYPTION_KEY` - Data encryption key

### Monitoring & Observability

```typescript
import { SENTRY_DSN, NEW_RELIC_LICENSE_KEY } from "@e-n-v/schemas";
```

- `SENTRY_DSN` - Sentry error tracking DSN
- `NEW_RELIC_LICENSE_KEY` - New Relic license key
- `PROMETHEUS_PORT` - Prometheus metrics port

### Cloud Providers

#### AWS

```typescript
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "@e-n-v/schemas";
```

#### Azure

```typescript  
import { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID } from "@e-n-v/schemas";
```

### Message Queues & Caching

#### Redis

```typescript
import { REDIS_URL, REDIS_HOST, REDIS_PORT } from "@e-n-v/schemas";
```

#### RabbitMQ

```typescript
import { RABBITMQ_URL, RABBITMQ_HOST } from "@e-n-v/schemas";
```

#### Kafka

```typescript
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from "@e-n-v/schemas";
```

## Creating Custom Variants

All schemas are factory functions that accept customization options:

```typescript
import { port, databaseUrl, nodeEnv } from "@e-n-v/schemas";

// Custom port with different default
const CUSTOM_PORT = port({ default: 8080 });

// Required database URL (no default)
const REQUIRED_DATABASE_URL = databaseUrl({ required: true });

// Custom NODE_ENV with additional environments
const CUSTOM_NODE_ENV = nodeEnv({ 
  description: "Application environment with staging",
  // Add custom validation if needed
});
```

## Schema Properties

Each schema includes:

- **Validation**: Type-safe validation with helpful error messages
- **Defaults**: Sensible default values where appropriate
- **Descriptions**: Human-readable descriptions for documentation
- **Secret marking**: Automatic secret detection for sensitive values
- **Constraints**: Proper min/max values and format validation

## Usage with e·n·v Packages

### With `@e-n-v/env`

```typescript
import { spec, parse } from "@e-n-v/env";
import { NODE_ENV, DATABASE_URL, OPENAI_API_KEY } from "@e-n-v/schemas";

const envModel = define({
  schemas: { NODE_ENV, DATABASE_URL, OPENAI_API_KEY },
  preprocess: true,
});

const env = parse({ source: process.env, spec: envSpec });
// Fully typed and validated environment variables
```

### With `@e-n-v/prompt`

```typescript
import { prompt } from "@e-n-v/prompt";
import { NODE_ENV, DATABASE_URL, OPENAI_API_KEY } from "@e-n-v/schemas";

await prompt({
  vars: { NODE_ENV, DATABASE_URL, OPENAI_API_KEY },
  path: ".env",
});
// Interactive setup with validation and secret masking
```

## Schema Types

Schemas are available in multiple formats:

### Native e·n·v Schemas (Default)

```typescript
import { NODE_ENV, PORT } from "@e-n-v/schemas";
// Uses native EnvVarSchema instances
```

### Zod Schemas

```typescript
import { NODE_ENV, PORT } from "@e-n-v/schemas/zod";
// Pure Zod schemas for direct use
```

## Validation Features

- **Format validation** (URLs, API keys, email addresses)
- **Range constraints** (ports, timeouts, pool sizes)  
- **Pattern matching** (JWT durations, environment names)
- **Protocol requirements** (HTTPS for webhooks)
- **Length requirements** (minimum lengths for secrets)
- **Type coercion** (strings to numbers where appropriate)

## Error Messages

Schemas provide clear, actionable error messages:

```typescript
// Instead of generic "invalid value"
PORT: "Port must be >= 1024 (avoid reserved ports)"
JWT_SECRET: "JWT secret must be at least 32 characters long for security"  
WEBHOOK_URL: "Webhook URLs should use HTTPS for security"
```

## License

MIT
