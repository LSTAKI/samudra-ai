/**
 * Unified API Client for Project ORCA
 * Connects to the backend REST service with timeout handling,
 * error normalization, and honest fallback states.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponseEnvelope<T> {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE' | 'STALE';
  source?: string;
  dataset?: string;
  observation_time?: string;
  retrieved_at?: string;
  data: T | null;
  error?: string | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out after ${timeoutMs / 1000}s`);
    }
    throw error;
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
