/**
 * Core types for the REST API Data Provider
 * Provides TypeScript interfaces for all data provider operations
 */

/**
 * Main Data Provider interface exposing CRUD and custom operations
 */
export interface DataProvider {
  getList: <T = any>(params: GetListParams) => Promise<GetListResult<T>>;
  getOne: <T = any>(params: GetOneParams) => Promise<GetOneResult<T>>;
  create: <T = any>(params: CreateParams) => Promise<CreateResult<T>>;
  update: <T = any>(params: UpdateParams) => Promise<UpdateResult<T>>;
  deleteOne: <T = any>(params: DeleteOneParams) => Promise<DeleteOneResult>;
  custom: <T = any>(params: CustomParams) => Promise<CustomResult<T>>;
}

/**
 * Parameters for fetching a list of resources
 */
export interface GetListParams {
  resource: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  filters?: Filter[];
  meta?: Record<string, any>;
}

/**
 * Result from fetching a list of resources
 */
export interface GetListResult<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Parameters for fetching a single resource
 */
export interface GetOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, any>;
}

/**
 * Result from fetching a single resource
 */
export interface GetOneResult<T> {
  data: T;
}

/**
 * Parameters for creating a new resource
 */
export interface CreateParams {
  resource: string;
  variables: Record<string, any>;
  meta?: Record<string, any>;
}

/**
 * Result from creating a resource
 */
export interface CreateResult<T> {
  data: T;
}

/**
 * Parameters for updating an existing resource
 */
export interface UpdateParams {
  resource: string;
  id: string | number;
  variables: Record<string, any>;
  meta?: Record<string, any>;
}

/**
 * Result from updating a resource
 */
export interface UpdateResult<T> {
  data: T;
}

/**
 * Parameters for deleting a resource
 */
export interface DeleteOneParams {
  resource: string;
  id: string | number;
  meta?: Record<string, any>;
}

/**
 * Result from deleting a resource
 */
export interface DeleteOneResult {
  data: Record<string, any>;
}

/**
 * Parameters for custom API requests
 */
export interface CustomParams {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: Record<string, any>;
  query?: Record<string, any>;
  headers?: HeadersInit;
  meta?: Record<string, any>;
}

/**
 * Result from custom API requests
 */
export interface CustomResult<T> {
  data: T;
}

/**
 * Filter definition for querying resources
 */
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'nin' | 'contains' | 'ncontains';
  value: any;
}

/**
 * Configuration options for creating a data provider
 */
export interface DataProviderConfig {
  apiUrl: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  httpClient?: HttpClient;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
  errorHandler?: (error: any) => Error;
}

/**
 * HTTP client function signature
 */
export interface HttpClient {
  (url: string, options?: RequestInit): Promise<Response>;
}

/**
 * Extended Error type for API errors
 */
export interface ApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}
