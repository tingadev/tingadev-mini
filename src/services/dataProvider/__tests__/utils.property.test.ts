/**
 * Property-based tests for utility functions
 * Feature: rest-api-data-provider
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateResourceUrl, pageToOffset } from '../utils';

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
});
