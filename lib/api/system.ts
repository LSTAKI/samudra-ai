/**
 * System Health & Provider Telemetry Client
 */
import { apiRequest } from './client';

export interface SystemHealthResponse {
  status: 'CONNECTED' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE';
  version: string;
  timestamp: string;
  services: Record<string, string>;
  cache_items_count: number;
}

export interface SystemSource {
  id: string;
  name: string;
  status: string;
  mode: string;
  endpoint: string;
  authenticated: boolean;
}

export async function fetchSystemHealth(): Promise<SystemHealthResponse> {
  try {
    return await apiRequest<SystemHealthResponse>('system/health');
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        backend: 'UNAVAILABLE',
        copernicus_wmts: 'CONNECTED',
        imd_gateway: 'CONNECTED',
        mosdac_gateway: 'UNAVAILABLE',
        agent_platform: 'NOT CONNECTED'
      },
      cache_items_count: 0
    };
  }
}

export async function fetchSystemSources(): Promise<SystemSource[]> {
  try {
    const res = await apiRequest<{ sources: SystemSource[] }>('system/sources');
    return res.sources || [];
  } catch {
    return [];
  }
}
