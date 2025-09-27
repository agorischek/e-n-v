# Pre-built Environment Variable Schemas

This directory contains pre-built Zod schemas for common environment variables used in modern applications. These schemas provide validation, type safety, and helpful descriptions for environment variables.

## Usage

```typescript
import { askEnv } from "ask-env";
import { 
  APPLICATIONINSIGHTS_CONNECTION_STRING,
  DATABASE_URL_POSTGRESQL,
  JWT_SECRET,
  PORT 
} from "ask-env/schemas";

await askEnv({
  APPLICATIONINSIGHTS_CONNECTION_STRING,
  DATABASE_URL: DATABASE_URL_POSTGRESQL,
  JWT_SECRET,
  PORT,
});
```

## Available Schema Categories

### Application Insights (`applicationInsights.ts`)
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Azure Application Insights connection string
- `APPINSIGHTS_INSTRUMENTATIONKEY` - Legacy instrumentation key format
- `APPINSIGHTS_ROLE_NAME` - Role name for distributed tracing
- `APPINSIGHTS_SAMPLING_RATE` - Telemetry sampling rate (0-100)
- Various auto-collection boolean flags

### Database (`database.ts`)
- `DATABASE_URL_POSTGRESQL` - PostgreSQL connection string
- `DATABASE_URL_MYSQL` - MySQL connection string
- `DATABASE_URL_MONGODB` - MongoDB connection string
- `DATABASE_URL_SQLSERVER` - SQL Server connection string
- `REDIS_URL` - Redis connection string
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` - Individual components
- `DATABASE_POOL_SIZE`, `DATABASE_TIMEOUT` - Connection settings

### API & Services (`apiService.ts`)
- `API_KEY` - Generic API key validation
- `JWT_SECRET` - JWT signing secret with strong requirements
- `JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_EXPIRES_IN` - Token expiration
- `API_BASE_URL`, `SERVICE_URL`, `WEBHOOK_URL` - Service URLs
- OAuth configuration: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, etc.
- `CORS_ORIGIN`, `RATE_LIMIT_RPM` - API configuration
- `NODE_ENV`, `PORT`, `HOST` - Application settings

### Infrastructure (`infrastructure.ts`)
- **Azure**: Storage connection strings, Service Bus, Event Hub
- **AWS**: S3, SQS, access keys, regions
- **Message Queues**: RabbitMQ, Kafka configuration
- **Search**: Elasticsearch/OpenSearch URLs and credentials
- **Monitoring**: Prometheus, Jaeger, New Relic, Datadog, Sentry
- **Containers**: Docker registry, Kubernetes namespace/service account

## Schema Features

All schemas include:
- **Type validation** - Ensures correct data types
- **Format validation** - Validates connection string formats, URLs, etc.
- **Length constraints** - Minimum/maximum length requirements
- **Security requirements** - Strong validation for secrets and keys
- **Helpful descriptions** - Clear descriptions shown in prompts
- **Default values** - Sensible defaults where appropriate

## Examples

### Basic Usage
```typescript
import { askEnv, PORT, NODE_ENV } from "ask-env";

await askEnv({
  PORT,
  NODE_ENV,
});
```

### Using Schema Groups
```typescript
import { askEnv, databaseSchemas, apiServiceSchemas } from "ask-env/schemas";

await askEnv({
  ...databaseSchemas,
  API_KEY: apiServiceSchemas.API_KEY,
  JWT_SECRET: apiServiceSchemas.JWT_SECRET,
});
```

### Custom Validation with Pre-built Schemas
```typescript
import { z } from "zod";
import { askEnv, JWT_SECRET } from "ask-env";

await askEnv({
  JWT_SECRET: JWT_SECRET.min(64, "Production JWT secret must be at least 64 characters"),
  CUSTOM_VAR: z.string().describe("My custom variable"),
});
```

## Extending Schemas

You can extend or modify the pre-built schemas:

```typescript
import { z } from "zod";
import { PORT } from "ask-env/schemas";

// Extend with additional constraints
const PRODUCTION_PORT = PORT.min(8000).max(9000);

// Create variations
const DEV_JWT_SECRET = z.string().min(16).describe("Development JWT secret");
const PROD_JWT_SECRET = z.string().min(64).describe("Production JWT secret (high security)");
```