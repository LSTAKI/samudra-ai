export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DataSource = 'ISRO' | 'INCOIS' | 'NOAA' | 'Copernicus';

export type OceanParameter =
  | 'sst'
  | 'sstAnomaly'
  | 'waveHeight'
  | 'swell'
  | 'currents'
  | 'wind'
  | 'seaLevel'
  | 'salinity'
  | 'chlorophyll'
  | 'heatwave'
  | 'cyclone';

export interface OceanObservation {
  latitude: number;
  longitude: number;
  sst: number; // °C
  sstAnomaly: number; // °C
  waveHeight: number; // m
  chlorophyll: number; // mg/m³
  windSpeed: number; // m/s
  windDirection: number; // degrees
  currentSpeed?: number; // m/s
  currentDirection?: number; // degrees
  source: string;
  timestamp: string;
  confidence: ConfidenceLevel;
}

export type LayerSource = 'COPERNICUS' | 'ISRO' | 'INCOIS' | 'NOAA' | 'ORCA';
export type LayerType = 'raster' | 'vector' | 'geojson' | 'wms' | 'wmts';
export type LayerStatus = 'CONNECTED' | 'LOADING' | 'ERROR' | 'UNAVAILABLE' | 'DEMO';
export type TimelineFrameType = 'OBSERVATION' | 'FORECAST' | 'UNAVAILABLE';

export interface OceanMapLayer {
  id: string;
  name: string;
  source: LayerSource;
  type: LayerType;
  productId?: string;
  datasetId?: string;
  variable: string;
  unit: string;
  temporalResolution?: string;
  spatialResolution?: string;
  style?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  legend?: {
    url?: string;
    unit?: string;
    title?: string;
    format?: string;
  };
  time?: string;
  availableTimes?: string[];
  status: LayerStatus;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'parameter' | 'boundary' | 'source';
  active: boolean;
  source: string;
  legendPreview?: string;
}

export interface Provenance {
  source: string;
  dataset: string;
  coordinates: string;
  timestamp: string;
  processing: string;
  validation: string;
  confidence: ConfidenceLevel;
}

export interface Consensus {
  values: { sensor: string; value: string }[];
  consensusValue: string;
  difference: string;
  confidence: ConfidenceLevel;
}

export interface AIMessage {
  id: string;
  question: string;
  analysis: string;
  dataEvidence: { sensor: string; value: string }[];
  consensus?: Consensus;
  confidence: ConfidenceLevel;
  provenance: Provenance[];
}

export interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  distance: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
}

export interface TimelineState {
  mode: 'daily' | 'monthly' | 'annual';
  index: number;
  isPlaying: boolean;
}

export interface PFZData {
  sector: string;
  sstFront: string;
  chlorophyllFront: string;
  estimatedProductivity: string;
  source: string;
  confidence: ConfidenceLevel;
  polygon: [number, number][]; // coordinates bounding the front
}

export * from './satellite';
export * from './pfz';
export * from './analytics';
export * from './command';

