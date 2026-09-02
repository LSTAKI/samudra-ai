/**
 * External Agent Platform Gateway Client
 * Decoupled bridge to the separate multi-agent reasoning intelligence platform.
 */
import { apiRequest } from './client';

export interface AgentPlatformStatus {
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
  connected: boolean;
  message: string;
  endpoint: string | null;
}

export async function fetchAgentPlatformStatus(): Promise<AgentPlatformStatus> {
  try {
    return await apiRequest<AgentPlatformStatus>('agents/status');
  } catch {
    return {
      status: 'NOT_CONNECTED',
      connected: false,
      message: 'The multi-agent reasoning intelligence platform is hosted separately. Configure AGENT_PLATFORM_URL to connect.',
      endpoint: null
    };
  }
}

export async function queryAgentPlatform(query: string, coords?: { lat: number; lng: number }): Promise<any> {
  try {
    return await apiRequest('agents/query', {
      method: 'POST',
      body: JSON.stringify({ query, latitude: coords?.lat, longitude: coords?.lng })
    });
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      connected: false,
      error: 'External multi-agent platform is not connected.'
    };
  }
}
