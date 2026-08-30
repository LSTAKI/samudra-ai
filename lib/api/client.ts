// API Client wrapper for Project ORCA
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // If backend API URL is configured, we can perform actual fetch requests.
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}:`, error);
      throw error;
    }
  }

  // Otherwise, we throw an error indicating backend integration is required.
  // Visual pages will catch errors or use mock fallbacks directly to bypass this.
  throw new Error('API client in mock-only fallback mode. No backend URL provided.');
}

// Utility to mock API delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
