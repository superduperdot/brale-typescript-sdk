/**
 * Jest test setup configuration
 */

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup global test environment
beforeAll(() => {
  // Setup any global test configuration
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup after each test
});

// Extend Jest matchers if needed
// declare global {
//   namespace jest {
//     interface Matchers<R> {
//       // Add custom matchers here if needed
//     }
//   }
// }

export {}; // Make this file a module