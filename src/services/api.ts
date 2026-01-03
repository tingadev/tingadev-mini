/**
 * API Service Configuration
 * 
 * Configured data provider instance for the application
 */

import { createDataProvider } from './dataProvider';
import { getAccessToken } from 'zmp-sdk';

/**
 * Get authentication token for API requests
 * Uses Zalo Mini App SDK to get access token
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Get token from Zalo SDK - returns a string directly
    const token = await getAccessToken({});
    return token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

/**
 * Main data provider instance
 * 
 * Configured with Zalo Mini App authentication
 */
export const dataProvider = createDataProvider({
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  headers: async () => {
    const token = await getAuthToken();
    
    return {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
      'X-App-ID': import.meta.env.VITE_APP_ID || '',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },
});

/**
 * Data provider with request/response transformation
 * 
 * Use this if your backend has a specific data format
 */
export const dataProviderWithTransform = createDataProvider({
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  headers: async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },
  transformRequest: (data) => ({
    ...data,
    timestamp: Date.now(),
    appId: import.meta.env.VITE_APP_ID,
  }),
  transformResponse: (data) => {
    // Handle different backend response formats
    // Example: { success: true, payload: {...} }
    if (data.payload) return data.payload;
    // Example: { data: {...} }
    if (data.data) return data.data;
    // Return as-is
    return data;
  },
});

/**
 * Data provider with custom error handling
 * 
 * Handles authentication errors and redirects
 */
export const dataProviderWithErrorHandler = createDataProvider({
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  headers: async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },
  errorHandler: (error) => {
    // Handle authentication errors
    if (error.statusCode === 401) {
      console.error('Unauthorized - token may be expired');
      // You can trigger a token refresh or redirect to login here
      // window.location.href = '/login';
    }
    
    // Handle forbidden errors
    if (error.statusCode === 403) {
      console.error('Forbidden - insufficient permissions');
    }
    
    // Handle server errors
    if (error.statusCode && error.statusCode >= 500) {
      console.error('Server error - please try again later');
    }
    
    return error;
  },
});

/**
 * Helper function to manually refresh authentication token
 */
export const refreshAuthToken = async (): Promise<void> => {
  try {
    // Force get a new token
    const token = await getAccessToken({});
    console.log('Token refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};