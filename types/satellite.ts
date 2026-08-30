import { LayerStatus } from './index';

export type SensorCategory =
  | 'ALL'
  | 'VISIBLE_INFRARED'
  | 'OCEAN_COLOUR'
  | 'MICROWAVE'
  | 'ALTIMETRY'
  | 'METEOROLOGICAL';

export type SatelliteProductCategory =
  | 'ALL'
  | 'SST'
  | 'CHLOROPHYLL'
  | 'SEA_LEVEL'
  | 'WIND_WAVES'
  | 'ATMOSPHERIC';

export interface SatelliteSensor {
  id: string;
  name: string;
  category: SensorCategory;
  description: string;
  spectralBands?: string;
  spatialResolution?: string;
  verified: boolean;
}

export interface SatellitePlatform {
  id: string;
  name: string;
  agency: 'ISRO' | 'ESA / EUMETSAT' | 'NOAA / NASA';
  orbitType: 'GEOSTATIONARY' | 'SUN_SYNCHRONOUS_LEO' | 'POLAR_LEO';
  altitudeKm: number;
  inclinationDeg: number;
  mission: string;
  status: LayerStatus;
  feedType: 'REAL DATA' | 'MOCK FEED';
  sensors: SatelliteSensor[];
  verifiedProducts: string[];
}

export interface SatelliteObservation {
  id: string;
  platformId: string;
  platformName: string;
  sensorId: string;
  sensorName: string;
  sensorCategory: SensorCategory;
  productId: string;
  productName: string;
  productCategory: SatelliteProductCategory;
  timestamp: string; // ISO UTC
  timeOfDay: string; // e.g. "04:20 UTC"
  latitude: number;
  longitude: number;
  footprintGeoJson?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  groundTrackGeoJson?: {
    type: 'LineString';
    coordinates: number[][];
  };
  resolution: string;
  orbitPass: string; // e.g. "Pass #412 (Ascending)"
  cloudCoverage?: string;
  status: 'DEMO' | 'CONNECTED';
  source: string;
  relatedCopernicusLayer?: string; // e.g. 'copernicus-sst', 'copernicus-chl'
}
