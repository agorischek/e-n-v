import { askEnv } from './src/askEnv';

// Simple test for the string prompt with error state
askEnv({
  DATABASE_URL: {
    description: 'Database connection URL',
    validate: () => 'This is a test error to show error styling in yellow'
  }
}, '.env.test');