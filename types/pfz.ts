import { ConfidenceLevel, LayerStatus } from './index';

export type PFZClassification = 'HIGH' | 'MODERATE' | 'LOW';

export interface PFZFactor {
  name: string;
  weight: number; // 0 - 100
  status: 'FAVORABLE' | 'MODERATE' | 'UNFAVORABLE' | 'UNAVAILABLE';
  description: string;
  source: string;
  isReal: boolean;
}

export interface PFZZone {
  id: string;
  name: string;
  sector: string;
  latitude: number;
  longitude: number;
  score: number; // 0 - 100
  classification: PFZClassification;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryFactor: string;
  status: 'DEMO';
  timestamp: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  metrics: {
    sst: number; // °C
    sstAnomaly?: number; // °C
    chlorophyll: number; // mg/m³
    waveHeight: number; // m
    currentVelocity?: string; // m/s or 'UNAVAILABLE'
    depthMeters?: number;
  };
  factors: PFZFactor[];
}

export interface PFZModelConfiguration {
  weights: {
    sst: number;
    chlorophyll: number;
    current: number;
    waveHeight: number;
    bathymetry: number;
  };
  thresholds: {
    sstMin: number;
    sstMax: number;
    chlMin: number;
    chlMax: number;
    waveMax: number;
  };
}

export interface PFZRegionPreset {
  id: string;
  name: string;
  basin: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  defaultRadiusKm: number;
}
