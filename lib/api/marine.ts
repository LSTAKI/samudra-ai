import { apiRequest } from './client';

export interface MarineWarningResponse {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE' | 'STALE';
  source: string;
  dataset: string;
  retrieved_at: string;
  data: any | null;
  error?: string | null;
}

export async function fetchPortWarnings(): Promise<MarineWarningResponse> {
  try {
    return await apiRequest<MarineWarningResponse>('marine/port-warnings');
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD',
      dataset: 'Port Warnings & Cautionary Signals',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message
    };
  }
}

export async function fetchSeaBulletins(basin: string = 'arabian_sea'): Promise<MarineWarningResponse> {
  try {
    return await apiRequest<MarineWarningResponse>(`marine/sea-bulletins?basin=${basin}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD',
      dataset: 'Daily Sea Bulletin',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message
    };
  }
}

export async function fetchCoastalBulletins(state: string = 'kerala'): Promise<MarineWarningResponse> {
  try {
    return await apiRequest<MarineWarningResponse>(`marine/coastal-bulletins?state=${state}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD',
      dataset: 'Coastal Weather Bulletin',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message
    };
  }
}

export async function fetchFishermenWarnings(lat?: number, lon?: number): Promise<MarineWarningResponse> {
  try {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    return await apiRequest<MarineWarningResponse>(`marine/fishermen-warnings?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD (Marine Forecast Division)',
      dataset: 'Fishermen Sea Safety Warning Bulletin',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message || 'Official IMD fishermen warning feed unavailable.'
    };
  }
}

export async function fetchMonitoredPorts(): Promise<any> {
  try {
    return await apiRequest('marine/ports');
  } catch {
    return { status: 'UNAVAILABLE', ports: [] };
  }
}
