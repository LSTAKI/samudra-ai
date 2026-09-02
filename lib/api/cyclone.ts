import { apiRequest } from './client';

export interface CycloneDataResponse {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE';
  source: string;
  dataset: string;
  active_cyclones_count: number;
  retrieved_at: string;
  data: {
    status_message?: string;
    basin_state?: string;
    tracks?: any[];
    wind_radii?: any;
    cone_of_uncertainty?: any;
  } | null;
  error?: string | null;
}

export async function fetchActiveCyclones(): Promise<CycloneDataResponse> {
  try {
    return await apiRequest<CycloneDataResponse>('cyclones/active');
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD (Cyclone Warning Division)',
      dataset: 'North Indian Ocean Tropical Cyclone Advisory',
      active_cyclones_count: 0,
      retrieved_at: new Date().toISOString(),
      data: {
        status_message: 'Unable to connect to IMD Cyclone Warning Division endpoint.',
        basin_state: 'UNKNOWN',
        tracks: []
      },
      error: err.message
    };
  }
}
