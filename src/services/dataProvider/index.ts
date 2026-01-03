/**
 * REST API Data Provider
 * 
 * A TypeScript-based adapter for communicating with backend REST APIs.
 * Provides standardized CRUD operations, flexible configuration, and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * import { createDataProvider } from '@/services/dataProvider';
 * 
 * const dataProvider = createDataProvider({
 *   apiUrl: 'https://api.example.com',
 *   headers: () => ({
 *     'Authorization': `Bearer ${getToken()}`,
 *   }),
 * });
 * 
 * // Fetch a list of users
 * const users = await dataProvider.getList({ resource: 'users' });
 * ```
 */

// Export all types
export type {
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
  DeleteOneParams,
  DeleteOneResult,
  CustomParams,
  CustomResult,
  Filter,
  DataProviderConfig,
  HttpClient,
  ApiError,
} from './types';

// Export main factory function (will be implemented in later tasks)
export { createDataProvider } from './dataProvider';

// Export utility functions (will be implemented in later tasks)
export { generateResourceUrl, buildQueryParams } from './utils';

// Export HTTP client (will be implemented in later tasks)
export { createHttpClient } from './httpClient';

// Export error handler (will be implemented in later tasks)
export { handleError, createErrorHandler } from './errorHandler';
