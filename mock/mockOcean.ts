import { OceanObservation, DataSource } from '../types';

export interface TimeSeriesRecord {
  timestamp: string;
  sst: number;
  waveHeight: number;
  chlorophyll: number;
  windSpeed: number;
}

export interface LocationObservation {
  name: string;
  latitude: number;
  longitude: number;
  observation: OceanObservation;
  history: TimeSeriesRecord[];
}

export const mockLocations: LocationObservation[] = [
  {
    name: 'Kerala Coast (Kochi)',
    latitude: 9.9312,
    longitude: 76.2673,
    observation: {
      latitude: 9.9312,
      longitude: 76.2673,
      sst: 29.42,
      sstAnomaly: 0.81,
      waveHeight: 1.42,
      chlorophyll: 0.64,
      windSpeed: 8.5,
      windDirection: 240,
      currentSpeed: 0.35,
      currentDirection: 310,
      source: 'ISRO INSAT-3DS',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'HIGH'
    },
    history: [
      { timestamp: '-72h', sst: 28.50, waveHeight: 1.85, chlorophyll: 0.58, windSpeed: 10.2 },
      { timestamp: '-48h', sst: 28.85, waveHeight: 1.62, chlorophyll: 0.60, windSpeed: 9.5 },
      { timestamp: '-24h', sst: 29.10, waveHeight: 1.50, chlorophyll: 0.62, windSpeed: 9.0 },
      { timestamp: 'NOW', sst: 29.42, waveHeight: 1.42, chlorophyll: 0.64, windSpeed: 8.5 },
      { timestamp: '+24h', sst: 29.65, waveHeight: 1.30, chlorophyll: 0.65, windSpeed: 7.8 },
      { timestamp: '+48h', sst: 29.80, waveHeight: 1.25, chlorophyll: 0.68, windSpeed: 7.0 }
    ]
  },
  {
    name: 'Lakshadweep Sea',
    latitude: 10.5667,
    longitude: 72.6333,
    observation: {
      latitude: 10.5667,
      longitude: 72.6333,
      sst: 28.95,
      sstAnomaly: 0.35,
      waveHeight: 1.85,
      chlorophyll: 0.22,
      windSpeed: 11.2,
      windDirection: 255,
      currentSpeed: 0.42,
      currentDirection: 295,
      source: 'NOAA AVHRR',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'HIGH'
    },
    history: [
      { timestamp: '-72h', sst: 28.60, waveHeight: 2.10, chlorophyll: 0.20, windSpeed: 13.0 },
      { timestamp: '-48h', sst: 28.70, waveHeight: 2.00, chlorophyll: 0.21, windSpeed: 12.5 },
      { timestamp: '-24h', sst: 28.80, waveHeight: 1.90, chlorophyll: 0.21, windSpeed: 12.0 },
      { timestamp: 'NOW', sst: 28.95, waveHeight: 1.85, chlorophyll: 0.22, windSpeed: 11.2 },
      { timestamp: '+24h', sst: 29.05, waveHeight: 1.80, chlorophyll: 0.23, windSpeed: 10.5 },
      { timestamp: '+48h', sst: 29.15, waveHeight: 1.70, chlorophyll: 0.24, windSpeed: 9.8 }
    ]
  },
  {
    name: 'Arabian Sea (Offshore)',
    latitude: 12.0000,
    longitude: 70.0000,
    observation: {
      latitude: 12.0000,
      longitude: 70.0000,
      sst: 27.80,
      sstAnomaly: -0.15,
      waveHeight: 2.45,
      chlorophyll: 0.15,
      windSpeed: 14.8,
      windDirection: 260,
      currentSpeed: 0.55,
      currentDirection: 275,
      source: 'Copernicus Sentinel-3',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'HIGH'
    },
    history: [
      { timestamp: '-72h', sst: 27.95, waveHeight: 2.70, chlorophyll: 0.12, windSpeed: 16.5 },
      { timestamp: '-48h', sst: 27.90, waveHeight: 2.65, chlorophyll: 0.14, windSpeed: 16.0 },
      { timestamp: '-24h', sst: 27.85, waveHeight: 2.50, chlorophyll: 0.15, windSpeed: 15.2 },
      { timestamp: 'NOW', sst: 27.80, waveHeight: 2.45, chlorophyll: 0.15, windSpeed: 14.8 },
      { timestamp: '+24h', sst: 27.75, waveHeight: 2.40, chlorophyll: 0.16, windSpeed: 14.0 },
      { timestamp: '+48h', sst: 27.70, waveHeight: 2.30, chlorophyll: 0.17, windSpeed: 13.2 }
    ]
  },
  {
    name: 'Sri Lanka (Colombo Coast)',
    latitude: 6.9271,
    longitude: 79.8612,
    observation: {
      latitude: 6.9271,
      longitude: 79.8612,
      sst: 29.10,
      sstAnomaly: 0.50,
      waveHeight: 1.65,
      chlorophyll: 0.45,
      windSpeed: 9.8,
      windDirection: 225,
      currentSpeed: 0.28,
      currentDirection: 330,
      source: 'INCOIS OCM-3',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'MEDIUM'
    },
    history: [
      { timestamp: '-72h', sst: 28.90, waveHeight: 1.90, chlorophyll: 0.40, windSpeed: 11.5 },
      { timestamp: '-48h', sst: 29.00, waveHeight: 1.80, chlorophyll: 0.42, windSpeed: 10.8 },
      { timestamp: '-24h', sst: 29.05, waveHeight: 1.70, chlorophyll: 0.43, windSpeed: 10.2 },
      { timestamp: 'NOW', sst: 29.10, waveHeight: 1.65, chlorophyll: 0.45, windSpeed: 9.8 },
      { timestamp: '+24h', sst: 29.20, waveHeight: 1.60, chlorophyll: 0.46, windSpeed: 9.0 },
      { timestamp: '+48h', sst: 29.30, waveHeight: 1.50, chlorophyll: 0.48, windSpeed: 8.5 }
    ]
  },
  {
    name: 'Bay of Bengal (Central)',
    latitude: 15.0000,
    longitude: 88.0000,
    observation: {
      latitude: 15.0000,
      longitude: 88.0000,
      sst: 29.75,
      sstAnomaly: 1.15,
      waveHeight: 1.20,
      chlorophyll: 0.38,
      windSpeed: 7.2,
      windDirection: 180,
      currentSpeed: 0.22,
      currentDirection: 90,
      source: 'ISRO OCM-3',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'HIGH'
    },
    history: [
      { timestamp: '-72h', sst: 29.40, waveHeight: 1.40, chlorophyll: 0.35, windSpeed: 8.8 },
      { timestamp: '-48h', sst: 29.55, waveHeight: 1.35, chlorophyll: 0.36, windSpeed: 8.2 },
      { timestamp: '-24h', sst: 29.68, waveHeight: 1.25, chlorophyll: 0.37, windSpeed: 7.8 },
      { timestamp: 'NOW', sst: 29.75, waveHeight: 1.20, chlorophyll: 0.38, windSpeed: 7.2 },
      { timestamp: '+24h', sst: 29.85, waveHeight: 1.15, chlorophyll: 0.39, windSpeed: 6.8 },
      { timestamp: '+48h', sst: 29.90, waveHeight: 1.10, chlorophyll: 0.40, windSpeed: 6.2 }
    ]
  },
  {
    name: 'Andaman Sea (Port Blair)',
    latitude: 11.6234,
    longitude: 92.7265,
    observation: {
      latitude: 11.6234,
      longitude: 92.7265,
      sst: 28.60,
      sstAnomaly: 0.10,
      waveHeight: 1.35,
      chlorophyll: 0.52,
      windSpeed: 9.0,
      windDirection: 195,
      currentSpeed: 0.30,
      currentDirection: 120,
      source: 'Copernicus SLSTR',
      timestamp: '29 Aug 2026 08:00 UTC',
      confidence: 'HIGH'
    },
    history: [
      { timestamp: '-72h', sst: 28.30, waveHeight: 1.60, chlorophyll: 0.48, windSpeed: 10.5 },
      { timestamp: '-48h', sst: 28.40, waveHeight: 1.50, chlorophyll: 0.50, windSpeed: 9.8 },
      { timestamp: '-24h', sst: 28.50, waveHeight: 1.40, chlorophyll: 0.51, windSpeed: 9.2 },
      { timestamp: 'NOW', sst: 28.60, waveHeight: 1.35, chlorophyll: 0.52, windSpeed: 9.0 },
      { timestamp: '+24h', sst: 28.70, waveHeight: 1.30, chlorophyll: 0.53, windSpeed: 8.5 },
      { timestamp: '+48h', sst: 28.80, waveHeight: 1.25, chlorophyll: 0.55, windSpeed: 8.0 }
    ]
  }
];

export const getClosestObservation = (lat: number, lng: number): LocationObservation => {
  let closest = mockLocations[0];
  let minDist = Infinity;

  mockLocations.forEach((loc) => {
    const dist = Math.pow(loc.latitude - lat, 2) + Math.pow(loc.longitude - lng, 2);
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  });

  return closest;
};
