export type PFZClassification = 'HIGH' | 'MODERATE' | 'LOW';

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
  classification: PFZClassification;
  rationale: string;
  method_version?: string;
  input_datasets?: string[];
  computed_at?: string;
  eta_minutes?: number;
}

export interface PFZRegionPreset {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: [[number, number], [number, number]];
}
