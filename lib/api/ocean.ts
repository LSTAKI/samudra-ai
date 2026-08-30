import { OceanObservation } from '../../types';
import { mockLocations, getClosestObservation, TimeSeriesRecord } from '../../mock/mockOcean';
import { apiRequest, delay } from './client';

export async function getOceanObservations(): Promise<OceanObservation[]> {
  try {
    return await apiRequest<OceanObservation[]>('/ocean/observations');
  } catch (e) {
    // Mock fallback
    await delay(200);
    return mockLocations.map((loc) => loc.observation);
  }
}

export async function getOceanObservationDetails(
  lat: number,
  lng: number
): Promise<OceanObservation> {
  try {
    return await apiRequest<OceanObservation>(`/ocean/observation?lat=${lat}&lng=${lng}`);
  } catch (e) {
    // Mock fallback
    await delay(150);
    return getClosestObservation(lat, lng).observation;
  }
}

export async function getOceanTimeSeries(
  lat: number,
  lng: number
): Promise<TimeSeriesRecord[]> {
  try {
    return await apiRequest<TimeSeriesRecord[]>(`/ocean/timeseries?lat=${lat}&lng=${lng}`);
  } catch (e) {
    // Mock fallback
    await delay(150);
    return getClosestObservation(lat, lng).history;
  }
}
