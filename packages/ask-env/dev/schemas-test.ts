import { askEnv } from "../src/askEnv";
import { 
  APPLICATIONINSIGHTS_CONNECTION_STRING, 
  DATABASE_URL_POSTGRESQL,
  JWT_SECRET,
  PORT,
  NODE_ENV,
  API_KEY
} from "../../zod-env-var-schemas/src/schemas";

// Example of using the pre-built schemas
await askEnv({
  APPLICATIONINSIGHTS_CONNECTION_STRING,
  DATABASE_URL: DATABASE_URL_POSTGRESQL,
  JWT_SECRET,
  PORT,
  NODE_ENV,
  EXTERNAL_API_KEY: API_KEY,
}, {
  path: ".env.example"
});