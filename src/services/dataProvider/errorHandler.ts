/**
 * Error handling utilities for the Data Provider
 */

import type { ApiError } from './types';

/**
 * Transforms an HTTP Response into an ApiError
 * 
 * @param response - The HTTP Response object
 * @returns Promise resolving to an ApiError
 * 
 * @example
 * ```typescript
 * if (!response.ok) {
 *   throw await handleError(response);
 * }
 * ```
 */
export const handleError = async (response: Response): Promise<ApiError> => {
  const error: ApiError = new Error('An error occurred');
  error.name = 'ApiError';
  error.statusCode = response.status;

  try {
    const data = await response.json();
    error.message = data.message || data.error || response.statusText;
    error.errors = data.errors;
  } catch {
    error.message = response.statusText || 'An error occurred';
  }

  return error;
};

/**
 * Creates a custom error handler function
 * 
 * @returns Error handler function
 * 
 * @example
 * ```typescript
 * const errorHandler = createErrorHandler();
 * const apiError = errorHandler(someError);
 * ```
 */
export const createErrorHandler = () => {
  return (error: any): ApiError => {
    if (error instanceof Error && 'statusCode' in error) {
      return error as ApiError;
    }

    const apiError: ApiError = new Error(
      error.message || 'An unexpected error occurred'
    );
    apiError.name = 'ApiError';
    apiError.statusCode = error.statusCode || 500;

    return apiError;
  };
};
