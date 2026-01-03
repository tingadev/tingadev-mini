/**
 * HTTP Client wrapper for the Data Provider
 */

import type { HttpClient } from './types';

/**
 * Creates an HTTP client with base configuration
 * 
 * @param baseConfig - Optional base RequestInit configuration
 * @returns HTTP client function
 * 
 * @example
 * ```typescript
 * const client = createHttpClient({
 *   headers: { 'X-API-Key': 'secret' }
 * });
 * 
 * const response = await client('https://api.example.com/users');
 * ```
 */
export const createHttpClient = (
  baseConfig?: RequestInit
): HttpClient => {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const config: RequestInit = {
      ...baseConfig,
      ...options,
      headers: {
        ...(baseConfig?.headers || {}),
        ...(options?.headers || {}),
      },
    };

    return fetch(url, config);
  };
};
