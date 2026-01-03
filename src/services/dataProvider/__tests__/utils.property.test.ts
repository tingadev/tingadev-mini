/**
 * Property-based tests for utility functions
 * Feature: rest-api-data-provider
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateResourceUrl, pageToOffset, buildQueryParams } from '../utils';

// Helper to clean base URL (remove all trailing slashes)
const cleanBaseUrl = (url: string): string => {
  let clean = url;
  while (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
};

describe('Utils Property Tests', () => {
  /**
   * Feature: rest-api-data-provider, Property 1: URL Construction Consistency
   * Validates: Requirements 1.2, 1.4, 1.5, 3.1
   * 
   * For any base URL, resource name, and optional ID (string or number),
   * building a URL should always produce a valid, well-formed URL with the
   * correct base URL prepended, resource path, and ID segment when provided.
   */
  describe('Property 1: URL Construction Consistency', () => {
    it('should construct valid URLs for any base URL and resource', () => {
      fc.assert(
        fc.property(
          fc.webUrl(), // Generate random valid URLs
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/') && s.trim().length > 0), // Resource name without slashes and not just whitespace
          (baseUrl, resource) => {
            const url = generateResourceUrl(baseUrl, resource);
            
            const cleanBase = cleanBaseUrl(baseUrl);
            const cleanResource = resource.trim();
            
            // URL should contain the clean base
            expect(url).toContain(cleanBase);
            
            // URL should contain the resource
            expect(url).toContain(cleanResource);
            
            // URL should be well-formed (base + / + resource)
            expect(url).toBe(`${cleanBase}/${cleanResource}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should construct valid URLs with numeric IDs', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/') && s.trim().length > 0),
          fc.integer({ min: 1, max: 1000000 }),
          (baseUrl, resource, id) => {
            const url = generateResourceUrl(baseUrl, resource, id);
            
            const cleanBase = cleanBaseUrl(baseUrl);
            const cleanResource = resource.trim();
            
            // URL should contain base, resource, and ID
            expect(url).toBe(`${cleanBase}/${cleanResource}/${id}`);
            
            // URL should end with the ID
            expect(url.endsWith(String(id))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should construct valid URLs with string IDs', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/') && s.trim().length > 0),
          fc.uuid(), // Use UUID as string ID
          (baseUrl, resource, id) => {
            const url = generateResourceUrl(baseUrl, resource, id);
            
            const cleanBase = cleanBaseUrl(baseUrl);
            const cleanResource = resource.trim();
            
            // URL should contain base, resource, and ID
            expect(url).toBe(`${cleanBase}/${cleanResource}/${id}`);
            
            // URL should end with the ID
            expect(url.endsWith(id)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle base URLs with and without trailing slashes consistently', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/') && s.trim().length > 0),
          fc.option(fc.oneof(fc.integer({ min: 1 }), fc.uuid()), { nil: undefined }),
          (baseUrl, resource, id) => {
            const urlWithSlash = generateResourceUrl(baseUrl + '/', resource, id);
            const urlWithoutSlash = generateResourceUrl(baseUrl, resource, id);
            
            // Both should produce the same result
            expect(urlWithSlash).toBe(urlWithoutSlash);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: rest-api-data-provider, Property 8: Pagination Offset Conversion
   * Validates: Requirements 7.4
   * 
   * For any page number and page size, converting to offset-based pagination
   * should produce the correct offset value (offset = (page - 1) * pageSize).
   */
  describe('Property 8: Pagination Offset Conversion', () => {
    it('should correctly convert page numbers to offsets', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // page number
          fc.integer({ min: 1, max: 100 }), // page size
          (page, pageSize) => {
            const offset = pageToOffset(page, pageSize);
            const expectedOffset = (page - 1) * pageSize;
            
            expect(offset).toBe(expectedOffset);
            
            // Offset should be non-negative
            expect(offset).toBeGreaterThanOrEqual(0);
            
            // First page should have offset 0
            if (page === 1) {
              expect(offset).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce monotonically increasing offsets for increasing pages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 50 }),
          (page, pageSize) => {
            const offset1 = pageToOffset(page, pageSize);
            const offset2 = pageToOffset(page + 1, pageSize);
            
            // Next page should have larger offset
            expect(offset2).toBeGreaterThan(offset1);
            
            // Difference should equal page size
            expect(offset2 - offset1).toBe(pageSize);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: rest-api-data-provider, Property 3: Query Parameter Serialization Completeness
   * Validates: Requirements 6.1, 6.2, 6.3, 7.1, 7.2
   * 
   * For any combination of pagination parameters (page, pageSize), sort parameters (field, order),
   * and filter parameters (field, operator, value), serializing them to query string format
   * should include all provided parameters in the correct format.
   */
  describe('Property 3: Query Parameter Serialization Completeness', () => {
    it('should serialize pagination parameters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          (page, pageSize) => {
            const queryString = buildQueryParams({
              pagination: { page, pageSize },
            });
            
            // Should contain both parameters
            expect(queryString).toContain(`page=${page}`);
            expect(queryString).toContain(`pageSize=${pageSize}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should serialize sort parameters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.constantFrom('asc', 'desc'),
          (field, order) => {
            const queryString = buildQueryParams({
              sort: [{ field, order: order as 'asc' | 'desc' }],
            });
            
            // Parse the query string back to validate
            const params = new URLSearchParams(queryString);
            const sortValue = params.get('sort');
            
            // Should have sort parameter
            expect(sortValue).toBeTruthy();
            expect(sortValue).toBe(`${field}:${order}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should serialize filter parameters with all operators', () => {
      const operators = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in', 'nin', 'contains', 'ncontains'] as const;
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.constantFrom(...operators),
          fc.oneof(fc.string().filter(s => s.trim().length > 0), fc.integer(), fc.boolean()),
          (field, operator, value) => {
            const queryString = buildQueryParams({
              filters: [{ field, operator, value }],
            });
            
            // Parse the query string back to validate
            const params = new URLSearchParams(queryString);
            const filterKey = `filter[${field}][${operator}]`;
            const filterValue = params.get(filterKey);
            
            // Should have filter parameter with correct value
            expect(filterValue).toBeTruthy();
            expect(filterValue).toBe(String(value));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should serialize all parameters together', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 50 }),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.constantFrom('asc', 'desc'),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (page, pageSize, sortField, sortOrder, filterField, filterValue) => {
            const queryString = buildQueryParams({
              pagination: { page, pageSize },
              sort: [{ field: sortField, order: sortOrder as 'asc' | 'desc' }],
              filters: [{ field: filterField, operator: 'eq', value: filterValue }],
            });
            
            // Parse the query string back to validate
            const params = new URLSearchParams(queryString);
            
            // Should contain all parameters
            expect(params.get('page')).toBe(String(page));
            expect(params.get('pageSize')).toBe(String(pageSize));
            expect(params.get('sort')).toBe(`${sortField}:${sortOrder}`);
            expect(params.get(`filter[${filterField}][eq]`)).toBe(filterValue);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple sort parameters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              field: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              order: fc.constantFrom('asc', 'desc'),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (sortParams) => {
            const queryString = buildQueryParams({
              sort: sortParams as any,
            });
            
            // Parse the query string back to validate
            const params = new URLSearchParams(queryString);
            const sortValues = params.getAll('sort');
            
            // Should have correct number of sort parameters
            expect(sortValues.length).toBe(sortParams.length);
            
            // Each sort parameter should match
            sortParams.forEach(({ field, order }, index) => {
              expect(sortValues[index]).toBe(`${field}:${order}`);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple filter parameters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              field: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              operator: fc.constantFrom('eq', 'ne', 'lt', 'gt'),
              value: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (filterParams) => {
            const queryString = buildQueryParams({
              filters: filterParams as any,
            });
            
            // Parse the query string back to validate
            const params = new URLSearchParams(queryString);
            
            // Each filter parameter should be present with correct value
            filterParams.forEach(({ field, operator, value }) => {
              const filterKey = `filter[${field}][${operator}]`;
              expect(params.get(filterKey)).toBe(value);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
