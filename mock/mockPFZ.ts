import { PFZZone, PFZRegionPreset } from '@/types/pfz';
import { SafetyAlert } from '@/types';
import { eezBoundaryCoordinates, imblBoundaryCoordinates, imblWarningBufferCoordinates } from '@/lib/map/maritimeBoundaries';

export const mockEEZBoundary = eezBoundaryCoordinates;
export const mockIMBLBoundary = imblBoundaryCoordinates;
export const mockIMBLWarningBuffer = imblWarningBufferCoordinates;

export const mockSafetyAlerts: SafetyAlert[] = [];

export const pfzRegionPresets: PFZRegionPreset[] = [
  {
    id: 'kochi',
    name: 'Kochi / SW Kerala Shelf Front',
    center: [9.9312, 76.2673],
    zoom: 6.5,
    bounds: [[9.0, 75.0], [11.0, 77.0]]
  },
  {
    id: 'vizhinjam',
    name: 'Vizhinjam / Wadge Bank Perimeter',
    center: [8.3750, 76.9900],
    zoom: 7.0,
    bounds: [[7.5, 76.0], [9.0, 78.0]]
  }
];

export const mockPFZZones: PFZZone[] = [
  {
    id: 'pfz-sw-kerala-01',
    name: 'Kochi Deep Shelf Front',
    latitude: 9.8250,
    longitude: 75.9200,
    depth_m: 42,
    sst_c: 28.6,
    sst_gradient_c_per_km: 0.45,
    chlorophyll_mg_m3: 1.25,
    chlorophyll_gradient: 0.38,
    wave_height_m: 1.4,
    distance_km: 24.5,
    bearing_deg: 255,
    harbor: 'Kochi',
    score: 88,
    classification: 'HIGH',
    rationale: 'Strong thermal front (0.45°C/km) co-located with sharp chlorophyll-a accumulation plume along the 40m isobath.',
    method_version: 'v1.0-deterministic'
  },
  {
    id: 'pfz-sw-kerala-02',
    name: 'Alappuzha Upwelling Edge',
    latitude: 9.4100,
    longitude: 76.0800,
    depth_m: 35,
    sst_c: 28.3,
    sst_gradient_c_per_km: 0.38,
    chlorophyll_mg_m3: 1.05,
    chlorophyll_gradient: 0.31,
    wave_height_m: 1.2,
    distance_km: 31.0,
    bearing_deg: 235,
    harbor: 'Kochi',
    score: 82,
    classification: 'HIGH',
    rationale: 'Coastal upwelling core displaying persistent cool water tongue and elevated phytoplankton density.',
    method_version: 'v1.0-deterministic'
  }
];
