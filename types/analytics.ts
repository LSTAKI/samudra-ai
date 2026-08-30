import { OceanParameter, LayerStatus } from './index';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'custom';

export type AnalyticsSourceId = 'copernicus' | 'isro' | 'incois' | 'noaa';

export interface TimeSeriesPoint {
  date: string;
  value: number;
  unit: string;
  source: string;
  isReal: boolean;
}

export interface ParameterSeries {
  parameterId: OceanParameter;
  name: string;
  unit: string;
  source: string;
  data: TimeSeriesPoint[];
}

export interface AnomalyResult {
  parameter: string;
  currentValue: number;
  baselineValue: number;
  anomaly: number;
  anomalyPercent: number;
  unit: string;
  status: 'DEMO';
  classification: 'WARMING ANOMALY' | 'COOLING ANOMALY' | 'BLOOM ENHANCED' | 'NORMAL';
}

export interface RegionalComparisonItem {
  id: string;
  region: string;
  basin: string;
  currentValue: number;
  baselineValue: number;
  difference: number;
  unit: string;
  status: 'DEMO';
}

export interface SourceComparisonCell {
  sourceId: AnalyticsSourceId;
  sourceName: string;
  datasetName: string;
  variableName: string;
  value: number | null;
  unit: string;
  timestamp: string;
  quality: 'VALIDATED' | 'DEMO' | 'UNAVAILABLE';
  status: LayerStatus;
  feedType: 'REAL DATA' | 'MOCK FEED' | 'UNAVAILABLE';
}

export interface SourceComparisonRow {
  parameterId: string;
  parameterName: string;
  unit: string;
  cells: Record<AnalyticsSourceId, SourceComparisonCell>;
}

export interface DataQualityMetrics {
  spatialCoveragePct: number;
  temporalCompletenessPct: number;
  cloudMaskedPct: number;
  latencyHours: number;
  processingLevel: string;
  status: 'VALIDATED' | 'DEMO';
}
