/**
 * Copernicus Marine Oceanographic Data API Client
 */
import { OceanObservation } from '../../types';
import { apiRequest } from './client';

export interface TimeSeriesRecord {
  timestamp: string;
  sst: number;
  waveHeight: number;
  chlorophyll: number;
  windSpeed: number;
}

export async function getOceanObservations(): Promise<OceanObservation[]> {
  try {
    const res = await apiRequest<any>('ocean/layers');
    return res.layers || [];
  } catch {
    return [];
  }
}

export async function getOceanObservationDetails(
  lat: number,
  lng: number,
  layerId: string = 'copernicus-sst',
  time?: string
): Promise<any> {
  try {
    const params = new URLSearchParams({
      layer_id: layerId,
      lat: lat.toString(),
      lon: lng.toString()
    });
    if (time) params.append('time', time);
    return await apiRequest(`ocean/feature-info?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      latitude: lat,
      longitude: lng,
      error: err.message || 'Observation query unavailable'
    };
  }
}

export async function getOceanTimeSeries(
  lat: number,
  lng: number
): Promise<TimeSeriesRecord[]> {
  try {
    const res = await apiRequest<any>(`ocean/timeseries?lat=${lat}&lon=${lng}`);
    return res.records || [];
  } catch {
    return [];
  }
}
