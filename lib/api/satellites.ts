/**
 * Satellite Earth Observation API Client
 */
import { apiRequest } from './client';

export interface SatellitePlatform {
  id: string;
  name: string;
  agency: string;
  orbit_type: string;
  orbital_slot?: string;
  altitude_km?: number;
  status: string;
  payloads: string[];
  observation_target: string;
  resolution: string;
  temporal_cadence: string;
}

export interface SatelliteStatus {
  id: string;
  name: string;
  status: 'CONNECTED' | 'LOADING' | 'DEMO' | 'UNAVAILABLE' | 'ERROR';
  feedType: 'PLATFORM METADATA' | 'STANDBY' | 'UNAVAILABLE';
  latencyMs?: number;
}

export async function fetchSatellitePlatforms(): Promise<SatellitePlatform[]> {
  try {
    const res = await apiRequest<{ status: string; platforms: SatellitePlatform[] }>('satellites/platforms');
    return res.platforms || [];
  } catch {
    return [];
  }
}

export async function getSatelliteStatuses(): Promise<SatelliteStatus[]> {
  try {
    const platforms = await fetchSatellitePlatforms();
    if (platforms.length > 0) {
      return platforms.map((p) => ({
        id: p.id,
        name: p.name,
        status: 'CONNECTED',
        feedType: 'PLATFORM METADATA',
      }));
    }
  } catch {
    // Return honest unavailable
  }

  return [
    { id: 'insat-3ds', name: 'INSAT-3DS (ISRO)', status: 'UNAVAILABLE', feedType: 'UNAVAILABLE' },
    { id: 'oceansat-3', name: 'Oceansat-3 / EOS-06 (ISRO)', status: 'UNAVAILABLE', feedType: 'UNAVAILABLE' },
    { id: 'sentinel-3a', name: 'Sentinel-3A (Copernicus / ESA)', status: 'UNAVAILABLE', feedType: 'UNAVAILABLE' },
    { id: 'sentinel-6', name: 'Sentinel-6 Michael Freilich (NASA/ESA)', status: 'UNAVAILABLE', feedType: 'UNAVAILABLE' },
  ];
}
