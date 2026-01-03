/**
 * Unit tests for Data Provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDataProvider } from '../dataProvider';

// Mock fetch with proper typing
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe('Data Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getList', () => {
    it('should fetch a list of resources', async () => {
      const mockData = {
        data: [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }],
        total: 2,
      };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.getList({
        resource: 'users',
        pagination: { page: 1, pageSize: 10 },
      });

      expect(result.data).toEqual(mockData.data);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&pageSize=10',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle pagination, sorting, and filtering', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      await dataProvider.getList({
        resource: 'users',
        pagination: { page: 2, pageSize: 20 },
        sort: [{ field: 'name', order: 'asc' }],
        filters: [{ field: 'status', operator: 'eq', value: 'active' }],
      });

      const callUrl = (mockFetch as any).mock.calls[0][0];
      expect(callUrl).toContain('page=2');
      expect(callUrl).toContain('pageSize=20');
      expect(callUrl).toContain('sort=name%3Aasc'); // URL encoded
      expect(callUrl).toContain('filter%5Bstatus%5D%5Beq%5D=active'); // URL encoded
    });
  });

  describe('getOne', () => {
    it('should fetch a single resource with numeric ID', async () => {
      const mockData = { id: 1, name: 'User 1' };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.getOne({
        resource: 'users',
        id: 1,
      });

      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should fetch a single resource with string ID', async () => {
      const mockData = { id: 'abc-123', name: 'User 1' };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.getOne({
        resource: 'users',
        id: 'abc-123',
      });

      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/abc-123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' };
      const mockResponse = { id: 3, ...newUser };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.create({
        resource: 'users',
        variables: newUser,
      });

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newUser),
        })
      );
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const updates = { name: 'Updated User' };
      const mockResponse = { id: 1, ...updates };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.update({
        resource: 'users',
        id: 1,
        variables: updates,
      });

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a resource', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.deleteOne({
        resource: 'users',
        id: 1,
      });

      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('custom', () => {
    it('should make a custom GET request with query parameters', async () => {
      const mockData = { stats: { total: 100 } };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.custom({
        url: 'analytics/stats',
        method: 'GET',
        query: { startDate: '2024-01-01', endDate: '2024-12-31' },
      });

      expect(result.data).toEqual(mockData);
      const callUrl = (mockFetch as any).mock.calls[0][0];
      expect(callUrl).toContain('analytics/stats');
      expect(callUrl).toContain('startDate=2024-01-01');
      expect(callUrl).toContain('endDate=2024-12-31');
    });

    it('should make a custom POST request with payload', async () => {
      const payload = { users: [{ name: 'User 1' }] };
      const mockResponse = { imported: 1 };

      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      const result = await dataProvider.custom({
        url: 'users/bulk-import',
        method: 'POST',
        payload,
      });

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/bulk-import',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should handle absolute URLs', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'external' }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      await dataProvider.custom({
        url: 'https://external-api.com/data',
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://external-api.com/data',
        expect.any(Object)
      );
    });
  });

  describe('headers', () => {
    it('should include configured headers', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value',
        },
      });

      await dataProvider.getList({ resource: 'users' });

      const callOptions = (mockFetch as any).mock.calls[0][1];
      expect(callOptions.headers).toMatchObject({
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      });
    });

    it('should evaluate function-based headers', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
        headers: () => ({
          'Authorization': 'Bearer dynamic-token',
        }),
      });

      await dataProvider.getList({ resource: 'users' });

      const callOptions = (mockFetch as any).mock.calls[0][1];
      expect(callOptions.headers).toMatchObject({
        'Authorization': 'Bearer dynamic-token',
      });
    });
  });

  describe('transformations', () => {
    it('should transform request data', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
        transformRequest: (data) => ({
          ...data,
          timestamp: 123456789,
        }),
      });

      await dataProvider.create({
        resource: 'users',
        variables: { name: 'Test' },
      });

      const callOptions = (mockFetch as any).mock.calls[0][1];
      const body = JSON.parse(callOptions.body);
      expect(body).toMatchObject({
        name: 'Test',
        timestamp: 123456789,
      });
    });

    it('should transform response data', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          payload: { id: 1, name: 'User' },
        }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
        transformResponse: (data) => data.payload,
      });

      const result = await dataProvider.getOne({
        resource: 'users',
        id: 1,
      });

      expect(result.data).toEqual({ id: 1, name: 'User' });
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      await expect(
        dataProvider.getOne({ resource: 'users', id: 999 })
      ).rejects.toThrow();
    });

    it('should handle 500 errors', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
      });

      await expect(
        dataProvider.getList({ resource: 'users' })
      ).rejects.toThrow();
    });

    it('should use custom error handler', async () => {
      (mockFetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Unauthorized' }),
      });

      const customErrorHandler = vi.fn((error) => {
        error.message = 'Custom: ' + error.message;
        return error;
      });

      const dataProvider = createDataProvider({
        apiUrl: 'https://api.example.com',
        errorHandler: customErrorHandler,
      });

      await expect(
        dataProvider.getList({ resource: 'users' })
      ).rejects.toThrow('Custom:');

      expect(customErrorHandler).toHaveBeenCalled();
    });
  });
});
