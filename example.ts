import { z } from 'zod';
import { askEnv } from './src/index';

// Example usage of ask-env
const schemas = {
  // Database configuration
  DB_HOST: z.string().min(1, 'Database host is required'),
  DB_PORT: z.string()
    .regex(/^\d+$/, 'Must be a valid port number')
    .transform(Number)
    .refine(port => port > 0 && port <= 65535, 'Port must be between 1 and 65535'),
  DB_NAME: z.string().min(1, 'Database name is required'),
  DB_USER: z.string().min(1, 'Database user is required'),
  DB_PASSWORD: z.string().min(8, 'Password must be at least 8 characters'),
  
  // Application configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('3000'),
  
  // Optional features
  ENABLE_LOGGING: z.string()
    .transform(val => val.toLowerCase() === 'true')
    .default('true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  
  // API Keys
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  API_BASE_URL: z.string().url('Must be a valid URL').optional(),
};

// Run the interactive prompt
async function main() {
  console.log('Welcome to the ask-env example!');
  console.log('This will create a .env file with validated environment variables.\n');
  
  await askEnv(schemas, { 
    envPath: './example.env',
    overwrite: true 
  });
}

// Only run if this file is executed directly
if (import.meta.main) {
  main().catch(console.error);
}