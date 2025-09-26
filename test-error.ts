import { askEnv } from './src/askEnv';

// Test with validation that always fails to trigger error state
askEnv({
  DATABASE_URL: {
    description: 'Database connection URL',
    validate: () => 'This is a test error to show error styling in yellow'
  }
}, '.env.test');} from "zod";
import { askEnv } from './src/askEnv';

// Test with validation that always fails to trigger error state
const schemas = {
  DATABASE_URL: z.string()
    .describe('Database connection URL')
    .refine(() => false, { message: 'This is a test error to show error styling in yellow' })
};

askEnv(schemas, { envPath: '.env.test' });