import { LayerStatus } from './index';

export type OperationalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type OperationalEventCategory =
  | 'MARITIME SAFETY'
  | 'BOUNDARY'
  | 'ENVIRONMENTAL'
  | 'PFZ'
  | 'SATELLITE'
  | 'SYSTEM';

export type OperationalStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';

export interface OperationalEvent {
  id: string;
  category: OperationalEventCategory;
  severity: OperationalSeverity;
  status: 'DEMO';
  workflowStatus: OperationalStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string;
  source: string;
  product?: string;
  dataset?: string;
  variable?: string;
  dataStatus: 'DEMO' | 'REAL DATA' | 'UNAVAILABLE';
  metadata?: {
    vesselName?: string;
    vesselCallsign?: string;
    distanceKm?: number;
    pfzZoneId?: string;
    platformId?: string;
    anomalyMetric?: string;
  };
}

export interface DemoVessel {
  id: string;
  name: string;
  callsign: string;
  flag: string;
  type: string;
  latitude: number;
  longitude: number;
  heading: number; // degrees
  speedKnots: number;
  status: 'DEMO';
  track: [number, number][]; // [lng, lat]
}

export interface SystemServiceStatus {
  serviceId: string;
  name: string;
  status: LayerStatus;
  latencyMs?: number;
  description: string;
}
