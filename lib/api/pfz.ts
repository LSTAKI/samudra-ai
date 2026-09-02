/**
 * Potential Fishing Zone (PFZ) API Client
 * Connects to deterministic backend oceanographic gradient engine.
 */
import { apiRequest } from './client';

export interface PFZZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depth_m: number;
  sst_c: number;
  sst_gradient_c_per_km: number;
  chlorophyll_mg_m3: number;
  chlorophyll_gradient: number;
  wave_height_m: number;
  distance_km: number;
  bearing_deg: number;
  harbor: string;
  score: number;
  classification: 'HIGH' | 'MODERATE' | 'LOW';
  rationale: string;
  method_version?: string;
  input_datasets?: string[];
  computed_at?: string;
  eta_minutes?: number;
}

export interface PFZResponse {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE';
  method_version: string;
  source: string;
  reference_location: { latitude: number; longitude: number };
  zones_count: number;
  computed_at: string;
  zones: PFZZone[];
  error?: string | null;
}

export async function fetchPFZZones(
  lat?: number,
  lon?: number,
  harbor?: string
): Promise<PFZResponse> {
  try {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    if (harbor) params.append('harbor', harbor);

    return await apiRequest<PFZResponse>(`pfz/zones?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      method_version: 'v1.0-deterministic',
      source: 'ORCA Deterministic Oceanographic Slicer',
      reference_location: { latitude: lat || 9.9312, longitude: lon || 76.2673 },
      zones_count: 0,
      computed_at: new Date().toISOString(),
      zones: [],
      error: err.message || 'Unable to retrieve PFZ candidate zones from backend.'
    };
  }
}
