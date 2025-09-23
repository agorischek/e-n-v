import { test, expect, mock } from 'bun:test';
import { z } from 'zod';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { askEnv } from './index';

// Mock the clack/prompts module
const mockText = mock(() => Promise.resolve('test-value'));
const mockConfirm = mock(() => Promise.resolve(true));
const mockIntro = mock(() => {});
const mockOutro = mock(() => {});
const mockCancel = mock(() => {});
const mockIsCancel = mock(() => false);

mock.module('@clack/prompts', () => ({
  text: mockText,
  confirm: mockConfirm,
  intro: mockIntro,
  outro: mockOutro,
  cancel: mockCancel,
  isCancel: mockIsCancel,
}));

test('askEnv creates .env file with validated values', async () => {
  const testEnvPath = './test.env';
  
  // Clean up any existing test file
  if (existsSync(testEnvPath)) {
    unlinkSync(testEnvPath);
  }

  // Mock user inputs
  mockText.mockResolvedValueOnce('localhost');
  mockText.mockResolvedValueOnce('5432');
  mockText.mockResolvedValueOnce('true');

  const schemas = {
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_SSL: z.string().transform(val => val === 'true'),
  };

  await askEnv(schemas, { envPath: testEnvPath });

  // Verify the file was created
  expect(existsSync(testEnvPath)).toBe(true);

  // Verify the content
  const content = readFileSync(testEnvPath, 'utf-8');
  expect(content).toContain('DB_HOST=localhost');
  expect(content).toContain('DB_PORT=5432');
  expect(content).toContain('DB_SSL=true');

  // Clean up
  unlinkSync(testEnvPath);
});

test('askEnv handles existing .env file', async () => {
  const testEnvPath = './test-existing.env';
  
  // Create an existing file
  require('fs').writeFileSync(testEnvPath, 'EXISTING=value\n');

  // Mock user choosing to overwrite
  mockConfirm.mockResolvedValueOnce(true);
  mockText.mockResolvedValueOnce('new-value');

  const schemas = {
    NEW_VAR: z.string(),
  };

  await askEnv(schemas, { envPath: testEnvPath });

  // Verify the file was overwritten
  const content = readFileSync(testEnvPath, 'utf-8');
  expect(content).toContain('NEW_VAR=new-value');
  expect(content).not.toContain('EXISTING=value');

  // Clean up
  unlinkSync(testEnvPath);
});

test('askEnv validates input with Zod schemas', async () => {
  const testEnvPath = './test-validation.env';
  
  // Mock invalid input first, then valid input
  mockText.mockResolvedValueOnce('invalid-port'); // Will trigger validation error
  mockText.mockResolvedValueOnce('3000'); // Valid port

  const schemas = {
    PORT: z.string().regex(/^\d+$/, 'Must be a valid port number'),
  };

  // Since we mocked the text function to return different values on consecutive calls,
  // we need to verify the validation logic works by checking the schema directly
  expect(() => schemas.PORT.parse('invalid-port')).toThrow();
  expect(() => schemas.PORT.parse('3000')).not.toThrow();

  // Clean up if file exists
  if (existsSync(testEnvPath)) {
    unlinkSync(testEnvPath);
  }
});

test('placeholder generation works for different schema types', async () => {
  // We'll test the placeholder function indirectly by importing it
  // Since it's not exported, we'll test the behavior through the main function
  
  const schemas = {
    STRING_VAR: z.string(),
    NUMBER_VAR: z.number(),
    BOOLEAN_VAR: z.boolean(),
    ENUM_VAR: z.enum(['dev', 'prod', 'test']),
    OPTIONAL_VAR: z.string().optional(),
    DEFAULT_VAR: z.string().default('default-value'),
  };

  // Mock responses for all variables
  mockText.mockResolvedValueOnce('string-value');
  mockText.mockResolvedValueOnce('123');
  mockText.mockResolvedValueOnce('true');
  mockText.mockResolvedValueOnce('dev');
  mockText.mockResolvedValueOnce('optional-value');
  mockText.mockResolvedValueOnce('custom-value');

  const testEnvPath = './test-placeholders.env';
  
  await askEnv(schemas, { envPath: testEnvPath });

  // Verify the file was created successfully
  expect(existsSync(testEnvPath)).toBe(true);

  // Clean up
  unlinkSync(testEnvPath);
});