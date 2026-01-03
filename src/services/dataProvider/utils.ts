/**
 * Utility functions for the Data Provider
 */

import type { Filter } from './types';

/**
 * Generates a resource URL from base URL, resource name, and optional ID
 * 
 * @param baseUrl - The base API URL
 * @param resource - The resource name (e.g., 'users', 'posts')
 * @param id - Optional resource ID (string or number)
 * @returns The complete resource URL
 * 
 * @example
 * ```typescript
 * generateResourceUrl('https://api.example.com', 'users')
 * // => 'https://api.example.com/users'
 * 
 * generateResourceUrl('https://api.example.com/', 'users', 123)
 * // => 'https://api.example.com/users/123'
 * ```
 */
export const generateResourceUrl = (
  baseUrl: string,
  resource: string,
  id?: string | number
): string => {
  // Remove trailing slashes from base URL
  let cleanBaseUrl = baseUrl;
  while (cleanBaseUrl.endsWith('/')) {
    cleanBaseUrl = cleanBaseUrl.slice(0, -1);
  }
  
  const cleanResource = resource.trim();
  const path = id !== undefined ? `${cleanResource}/${id}` : cleanResource;
  return `${cleanBaseUrl}/${path}`;
};

/**
 * Builds query parameters string from pagination, sort, and filter options
 * 
 * @param params - Object containing pagination, sort, and filter parameters
 * @returns URL query string (without leading '?')
 * 
 * @example
 * ```typescript
 * buildQueryParams({
 *   pagination: { page: 1, pageSize: 10 },
 *   sort: [{ field: 'name', order: 'asc' }],
 *   filters: [{ field: 'status', operator: 'eq', value: 'active' }]
 * })
 * // => 'page=1&pageSize=10&sort=name:asc&filter[status][eq]=active'
 * ```
 */
export const buildQueryParams = (params: {
  pagination?: { page: number; pageSize: number };
  sort?: { field: string; order: 'asc' | 'desc' }[];
  filters?: Filter[];
}): string => {
  const queryParams = new URLSearchParams();

  if (params.pagination) {
    queryParams.append('page', params.pagination.page.toString());
    queryParams.append('pageSize', params.pagination.pageSize.toString());
  }

  if (params.sort && params.sort.length > 0) {
    params.sort.forEach((s) => {
      queryParams.append('sort', `${s.field}:${s.order}`);
    });
  }

  if (params.filters && params.filters.length > 0) {
    params.filters.forEach((f) => {
      queryParams.append(`filter[${f.field}][${f.operator}]`, String(f.value));
    });
  }

  return queryParams.toString();
};

/**
 * Converts page-based pagination to offset-based pagination
 * 
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns The offset value
 * 
 * @example
 * ```typescript
 * pageToOffset(1, 10) // => 0
 * pageToOffset(2, 10) // => 10
 * pageToOffset(3, 20) // => 40
 * ```
 */
export const pageToOffset = (page: number, pageSize: number): number => {
  return (page - 1) * pageSize;
};
