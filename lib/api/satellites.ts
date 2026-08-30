import { apiRequest, delay } from './client';
import { LayerStatus } from '@/types';

export interface SatelliteStatus {
  id: string;
  name: string;
  status: LayerStatus;
  feedType: 'REAL DATA' | 'MOCK FEED';
}

export async function getSatelliteStatuses(): Promise<SatelliteStatus[]> {
  try {
    return await apiRequest<SatelliteStatus[]>('/satellites/status');
  } catch (e) {
    await delay(100);
    return [
      { id: 'copernicus', name: 'Copernicus Marine OSTIA WMTS', status: 'CONNECTED', feedType: 'REAL DATA' },
      { id: 'mosdac', name: 'ISRO MOSDAC Receiver', status: 'DEMO', feedType: 'MOCK FEED' },
      { id: 'incois', name: 'INCOIS Ocean Buoys Server', status: 'DEMO', feedType: 'MOCK FEED' },
      { id: 'noaa', name: 'NOAA AVHRR Reanalysis Feed', status: 'DEMO', feedType: 'MOCK FEED' }
    ];
  }
}
