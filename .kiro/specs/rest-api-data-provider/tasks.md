# Implementation Plan: REST API Data Provider

## Overview

This implementation plan breaks down the REST API Data Provider into discrete, incremental coding tasks. Each task builds on previous work, starting with core types and utilities, then implementing the main data provider functionality, and finally adding comprehensive testing. The implementation will use TypeScript with Vitest for testing and fast-check for property-based testing.

## Tasks

- [x] 1. Set up project structure and core types
  - Create `src/services/dataProvider/` directory structure
  - Define all TypeScript interfaces and types in `types.ts`
  - Export types from `index.ts`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Implement utility functions
  - [x] 2.1 Implement URL building utilities
    - Write `generateResourceUrl` function to construct URLs from base URL, resource, and optional ID
    - Write `buildUrl` helper for internal use
    - _Requirements: 1.2, 1.4, 1.5, 3.1_

  - [x] 2.2 Write property test for URL construction
    - **Property 1: URL Construction Consistency**
    - **Validates: Requirements 1.2, 1.4, 1.5, 3.1**

  - [x] 2.3 Implement query parameter serialization
    - Write `buildQueryParams` function to convert pagination, sort, and filter objects to query strings
    - Handle all filter operators (eq, ne, lt, lte, gt, gte, in, nin, contains, ncontains)
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2_

  - [x] 2.4 Write property test for query parameter serialization
    - **Property 3: Query Parameter Serialization Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 7.1, 7.2**

  - [x] 2.5 Implement pagination offset conversion utility
    - Write function to convert page number and page size to offset
    - _Requirements: 7.4_

  - [x] 2.6 Write property test for pagination offset conversion
    - **Property 8: Pagination Offset Conversion**
    - **Validates: Requirements 7.4**

- [ ] 3. Implement error handling
  - [x] 3.1 Create error handler module
    - Implement `handleError` function to transform HTTP responses into ApiError
    - Implement `createErrorHandler` factory function
    - Extract error messages from response bodies
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 3.2 Write property test for error transformation
    - **Property 5: Error Transformation Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ] 3.3 Write unit tests for error handling
    - Test 4xx error handling
    - Test 5xx error handling
    - Test network error handling
    - Test timeout error handling
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Implement HTTP client wrapper
  - [x] 4.1 Create HTTP client wrapper
    - Implement `createHttpClient` function
    - Support base configuration merging
    - Use native fetch API
    - _Requirements: 9.1_

  - [ ] 4.2 Write unit tests for HTTP client
    - Test configuration merging
    - Test header merging
    - _Requirements: 2.1, 2.2_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement core data provider
  - [x] 6.1 Create data provider factory function
    - Implement `createDataProvider` function with configuration
    - Implement `getHeaders` helper to evaluate header functions
    - Implement `handleRequest` wrapper for all HTTP requests
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ] 6.2 Write property test for header merging
    - **Property 2: Header Merging and Evaluation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [x] 6.3 Implement getList method
    - Build URL with resource
    - Serialize pagination, sort, and filter parameters
    - Make GET request
    - Extract and return data with pagination metadata
    - _Requirements: 1.1, 5.1, 5.3, 7.3_

  - [x] 6.4 Implement getOne method
    - Build URL with resource and ID
    - Make GET request
    - Extract and return data
    - _Requirements: 1.2, 5.1_

  - [x] 6.5 Implement create method
    - Build URL with resource
    - Apply request transformation if configured
    - Make POST request with body
    - Extract and return data
    - _Requirements: 1.3, 5.2_

  - [x] 6.6 Implement update method
    - Build URL with resource and ID
    - Apply request transformation if configured
    - Make PUT request with body
    - Extract and return data
    - _Requirements: 1.4, 5.2_

  - [x] 6.7 Implement deleteOne method
    - Build URL with resource and ID
    - Make DELETE request
    - Extract and return data
    - _Requirements: 1.5_

  - [x] 6.8 Implement custom method
    - Build full URL (support both relative and absolute URLs)
    - Serialize query parameters if provided
    - Merge custom headers with global headers
    - Make request with specified method and payload
    - Extract and return data
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 7. Implement request and response transformation
  - [x] 7.1 Add transformation support to data provider
    - Apply `transformRequest` in create and update methods
    - Apply `transformResponse` in all methods
    - Handle wrapped response data (extract from "data" field)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.2 Write property test for response data extraction
    - **Property 6: Response Data Extraction and Transformation**
    - **Validates: Requirements 5.1, 5.3, 7.3**

  - [ ] 7.3 Write property test for request transformation
    - **Property 7: Request Transformation Application**
    - **Validates: Requirements 5.2**

- [ ] 8. Write CRUD operation tests
  - [ ] 8.1 Write property test for CRUD HTTP methods
    - **Property 4: CRUD Operation HTTP Method Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [ ] 8.2 Write unit tests for getList
    - Test with pagination
    - Test with sorting
    - Test with filters
    - Test with all parameters combined
    - _Requirements: 1.1_

  - [ ] 8.3 Write unit tests for getOne
    - Test with string ID
    - Test with numeric ID
    - _Requirements: 1.2_

  - [ ] 8.4 Write unit tests for create
    - Test with simple data
    - Test with nested data
    - _Requirements: 1.3_

  - [ ] 8.5 Write unit tests for update
    - Test with string ID
    - Test with numeric ID
    - _Requirements: 1.4_

  - [ ] 8.6 Write unit tests for deleteOne
    - Test with string ID
    - Test with numeric ID
    - _Requirements: 1.5_

- [ ] 9. Write custom method tests
  - [ ] 9.1 Write property test for custom requests
    - **Property 9: Custom Request Configuration**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

  - [ ] 9.2 Write unit tests for custom method
    - Test GET request with query parameters
    - Test POST request with payload
    - Test with custom headers
    - Test with absolute URL
    - Test with relative URL
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add integration tests
  - [ ] 11.1 Write integration tests with mock server
    - Test complete request/response cycle
    - Test authentication header injection
    - Test error scenarios end-to-end
    - Test with different backend response formats
    - _Requirements: 2.4, 4.1, 4.2, 4.3, 5.1, 5.2_

- [ ] 12. Create usage documentation and examples
  - [x] 12.1 Create main export file
    - Export all types and functions from `index.ts`
    - Add JSDoc comments for all exported items
    - _Requirements: 11.3_

  - [x] 12.2 Add inline code documentation
    - Add JSDoc comments to all public functions
    - Include usage examples in comments
    - Document all parameters and return types
    - _Requirements: 11.3_

- [ ] 13. Set up example integration
  - [x] 13.1 Create example API service file
    - Create `src/services/api.ts` with configured data provider
    - Use environment variables for API URL
    - Add example header configuration
    - _Requirements: 3.3, 9.2_

  - [x] 13.2 Create example usage in a component
    - Create example component showing getList usage
    - Create example component showing create/update/delete usage
    - Create example component showing custom method usage
    - Show integration with Jotai atoms
    - _Requirements: 9.4_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses native fetch API for Zalo Mini App compatibility
- Vitest is used for unit testing, fast-check for property-based testing
