/**
 * Core Data Provider implementation
 */

import type {
  DataProvider,
  DataProviderConfig,
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
} from './types';
import { generateResourceUrl, buildQueryParams } from './utils';
import { handleError } from './errorHandler';

/**
 * Creates a Data Provider instance
 * 
 * @param config - Configuration options for the data provider
 * @returns DataProvider instance with CRUD and custom methods
 * 
 * @example
 * ```typescript
 * const dataProvider = createDataProvider({
 *   apiUrl: 'https://api.example.com',
 *   headers: () => ({
 *     'Authorization': `Bearer ${getToken()}`,
 *   }),
 * });
 * 
 * const users = await dataProvider.getList({ resource: 'users' });
 * ```
 */
export const createDataProvider = (config: DataProviderConfig): DataProvider => {
  const {
    apiUrl,
    headers: configHeaders,
    httpClient = fetch,
    transformRequest,
    transformResponse,
    errorHandler: customErrorHandler,
  } = config;

  /**
   * Evaluates and returns headers (handles both static and function-based headers)
   */
  const getHeaders = async (): Promise<HeadersInit> => {
    if (typeof configHeaders === 'function') {
      return await configHeaders();
    }
    return configHeaders || {};
  };

  /**
   * Handles HTTP requests with error handling and response transformation
   */
  const handleRequest = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const headers = await getHeaders();
      const response = await httpClient(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw await handleError(response);
      }

      const data = await response.json();
      return transformResponse ? transformResponse(data) : data;
    } catch (error) {
      if (customErrorHandler) {
        throw customErrorHandler(error);
      }
      throw error;
    }
  };

  return {
    /**
     * Fetches a list of resources with optional pagination, sorting, and filtering
     */
    getList: async <T = any>(params: GetListParams): Promise<GetListResult<T>> => {
      const { resource, pagination, sort, filters, meta } = params;
      const url = generateResourceUrl(apiUrl, resource);
      const queryParams = buildQueryParams({ pagination, sort, filters });
      const fullUrl = queryParams ? `${url}?${queryParams}` : url;

      const result = await handleRequest<any>(fullUrl, {
        method: 'GET',
        ...meta,
      });

      return {
        data: result.data || result,
        total: result.total || result.data?.length || 0,
        page: pagination?.page,
        pageSize: pagination?.pageSize,
      };
    },

    /**
     * Fetches a single resource by ID
     */
    getOne: async <T = any>(params: GetOneParams): Promise<GetOneResult<T>> => {
      const { resource, id, meta } = params;
      const url = generateResourceUrl(apiUrl, resource, id);

      const result = await handleRequest<any>(url, {
        method: 'GET',
        ...meta,
      });

      return {
        data: result.data || result,
      };
    },

    /**
     * Creates a new resource
     */
    create: async <T = any>(params: CreateParams): Promise<CreateResult<T>> => {
      const { resource, variables, meta } = params;
      const url = generateResourceUrl(apiUrl, resource);
      const body = transformRequest ? transformRequest(variables) : variables;

      const result = await handleRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(body),
        ...meta,
      });

      return {
        data: result.data || result,
      };
    },

    /**
     * Updates an existing resource
     */
    update: async <T = any>(params: UpdateParams): Promise<UpdateResult<T>> => {
      const { resource, id, variables, meta } = params;
      const url = generateResourceUrl(apiUrl, resource, id);
      const body = transformRequest ? transformRequest(variables) : variables;

      const result = await handleRequest<any>(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...meta,
      });

      return {
        data: result.data || result,
      };
    },

    /**
     * Deletes a resource
     */
    deleteOne: async (params: DeleteOneParams): Promise<DeleteOneResult> => {
      const { resource, id, meta } = params;
      const url = generateResourceUrl(apiUrl, resource, id);

      const result = await handleRequest<any>(url, {
        method: 'DELETE',
        ...meta,
      });

      return {
        data: result.data || result || { id },
      };
    },

    /**
     * Makes a custom API request
     */
    custom: async <T = any>(params: CustomParams): Promise<CustomResult<T>> => {
      const { url, method, payload, query, headers: customHeaders, meta } = params;
      
      // Handle both absolute and relative URLs
      let fullUrl = url.startsWith('http') ? url : generateResourceUrl(apiUrl, url);
      
      // Add query parameters if provided
      if (query) {
        const queryString = new URLSearchParams(
          Object.entries(query).map(([key, value]) => [key, String(value)])
        ).toString();
        fullUrl = queryString ? `${fullUrl}?${queryString}` : fullUrl;
      }

      const result = await handleRequest<any>(fullUrl, {
        method,
        body: payload ? JSON.stringify(payload) : undefined,
        headers: customHeaders,
        ...meta,
      });

      return {
        data: result.data || result,
      };
    },
  };
};
