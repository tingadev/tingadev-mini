# Requirements Document

## Introduction

This document specifies the requirements for a REST API Data Provider adapter for a Zalo Mini App. The adapter will provide a clean, maintainable interface for communicating with backend services, supporting standard CRUD operations, custom headers, authentication, and error handling. The design is inspired by Refine's data provider pattern to ensure consistency and ease of maintenance.

## Glossary

- **Data_Provider**: The adapter interface that handles all REST API communication with the backend
- **API_Client**: The underlying HTTP client used to make network requests
- **Resource**: A backend entity or endpoint (e.g., "users", "posts", "products")
- **CRUD_Operations**: Create, Read, Update, Delete operations on resources
- **Custom_Headers**: HTTP headers that can be dynamically added to requests (e.g., authentication tokens, API keys)
- **Error_Handler**: Component responsible for processing and transforming API errors into user-friendly formats
- **Zalo_Mini_App**: The host application environment provided by Zalo platform

## Requirements

### Requirement 1: Core CRUD Operations

**User Story:** As a developer, I want to perform standard CRUD operations on backend resources, so that I can manage data consistently across the application.

#### Acceptance Criteria

1. WHEN a developer calls getList with a resource name, THE Data_Provider SHALL fetch a paginated list of items from the backend
2. WHEN a developer calls getOne with a resource name and ID, THE Data_Provider SHALL fetch a single item from the backend
3. WHEN a developer calls create with a resource name and data, THE Data_Provider SHALL send a POST request to create a new item
4. WHEN a developer calls update with a resource name, ID, and data, THE Data_Provider SHALL send a PUT or PATCH request to update an existing item
5. WHEN a developer calls deleteOne with a resource name and ID, THE Data_Provider SHALL send a DELETE request to remove an item

### Requirement 2: Custom Headers Support

**User Story:** As a developer, I want to pass custom headers with API requests, so that I can handle authentication, API keys, and other request metadata.

#### Acceptance Criteria

1. WHEN a developer configures the Data_Provider with custom headers, THE Data_Provider SHALL include those headers in all requests
2. WHEN a developer provides headers dynamically at request time, THE Data_Provider SHALL merge them with configured headers
3. WHEN header values are functions, THE Data_Provider SHALL evaluate them before making requests
4. WHEN authentication tokens are provided, THE Data_Provider SHALL include them in the Authorization header

### Requirement 3: Flexible API Configuration

**User Story:** As a developer, I want to configure the API base URL and endpoints, so that I can easily switch between development, staging, and production environments.

#### Acceptance Criteria

1. WHEN a developer initializes the Data_Provider with a base URL, THE Data_Provider SHALL prepend it to all resource paths
2. WHEN a developer provides custom endpoint mappings, THE Data_Provider SHALL use them instead of default conventions
3. WHEN environment variables are available, THE Data_Provider SHALL support loading configuration from them
4. WHERE different resources require different base URLs, THE Data_Provider SHALL support per-resource URL overrides

### Requirement 4: Error Handling and Transformation

**User Story:** As a developer, I want consistent error handling across all API calls, so that I can provide meaningful feedback to users.

#### Acceptance Criteria

1. WHEN an API request fails with a network error, THE Error_Handler SHALL transform it into a standardized error format
2. WHEN an API returns a 4xx status code, THE Error_Handler SHALL extract and format the error message
3. WHEN an API returns a 5xx status code, THE Error_Handler SHALL provide a generic server error message
4. WHEN an API request times out, THE Error_Handler SHALL return a timeout error with retry information

### Requirement 5: Request and Response Transformation

**User Story:** As a developer, I want to transform request and response data, so that I can adapt backend formats to frontend needs.

#### Acceptance Criteria

1. WHEN the backend returns data in a wrapped format, THE Data_Provider SHALL extract the actual data
2. WHEN the backend expects specific request formats, THE Data_Provider SHALL transform outgoing data accordingly
3. WHEN pagination metadata is returned, THE Data_Provider SHALL parse and expose it in a standard format
4. WHEN the backend uses different field names, THE Data_Provider SHALL map them to frontend conventions

### Requirement 6: Filtering and Sorting Support

**User Story:** As a developer, I want to filter and sort data on the backend, so that I can efficiently retrieve specific datasets.

#### Acceptance Criteria

1. WHEN a developer provides filter parameters, THE Data_Provider SHALL convert them to query string format
2. WHEN a developer provides sort parameters, THE Data_Provider SHALL include them in the request
3. WHEN multiple filters are applied, THE Data_Provider SHALL combine them correctly
4. WHEN the backend uses custom filter syntax, THE Data_Provider SHALL support transformation functions

### Requirement 7: Pagination Support

**User Story:** As a developer, I want to paginate large datasets, so that I can improve performance and user experience.

#### Acceptance Criteria

1. WHEN a developer requests a specific page, THE Data_Provider SHALL include page number in the request
2. WHEN a developer specifies page size, THE Data_Provider SHALL include it in the request
3. WHEN the backend returns total count, THE Data_Provider SHALL expose it for pagination controls
4. WHERE the backend uses offset-based pagination, THE Data_Provider SHALL support converting page numbers to offsets

### Requirement 8: TypeScript Type Safety

**User Story:** As a developer, I want full TypeScript support, so that I can catch errors at compile time and have better IDE support.

#### Acceptance Criteria

1. THE Data_Provider SHALL define TypeScript interfaces for all method parameters
2. THE Data_Provider SHALL define TypeScript interfaces for all response types
3. THE Data_Provider SHALL support generic types for resource-specific data
4. THE Data_Provider SHALL provide type inference for method return values

### Requirement 9: Zalo Mini App Integration

**User Story:** As a developer, I want the data provider to work seamlessly in the Zalo Mini App environment, so that I can leverage platform-specific features.

#### Acceptance Criteria

1. WHEN running in Zalo Mini App, THE Data_Provider SHALL use compatible HTTP client libraries
2. WHEN Zalo authentication is available, THE Data_Provider SHALL support including Zalo tokens
3. WHEN network connectivity changes, THE Data_Provider SHALL handle offline scenarios gracefully
4. THE Data_Provider SHALL work with the existing React and Jotai state management setup

### Requirement 10: Custom Query and Mutation Hooks

**User Story:** As a developer, I want to make custom API calls that don't fit standard CRUD patterns, so that I can handle special endpoints and operations.

#### Acceptance Criteria

1. WHEN a developer calls custom with a URL and method, THE Data_Provider SHALL make the request with the specified configuration
2. WHEN a developer provides custom query parameters, THE Data_Provider SHALL include them in the request
3. WHEN a developer provides custom headers for a specific request, THE Data_Provider SHALL merge them with global headers
4. WHEN a developer provides a request body for custom mutations, THE Data_Provider SHALL send it with the request
5. THE Data_Provider SHALL support all HTTP methods (GET, POST, PUT, PATCH, DELETE) for custom requests

### Requirement 11: Testing and Maintainability

**User Story:** As a developer, I want well-tested and maintainable code, so that I can confidently extend and modify the data provider.

#### Acceptance Criteria

1. THE Data_Provider SHALL have unit tests for all CRUD operations
2. THE Data_Provider SHALL have tests for error handling scenarios
3. THE Data_Provider SHALL have clear documentation with usage examples
4. THE Data_Provider SHALL follow consistent code organization and naming conventions
