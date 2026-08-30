import {
  TimeSeriesPoint,
  AnomalyResult,
  RegionalComparisonItem,
  SourceComparisonRow,
  DataQualityMetrics
} from '@/types/analytics';

export const analyticsRegions = [
  { id: 'arabian-sea', name: 'Arabian Sea Central', basin: 'Arabian Sea', centerLat: 14.5000, centerLng: 68.0000, zoom: 5.5 },
  { id: 'kerala-coast', name: 'Kerala Coast Shelf', basin: 'Arabian Sea Shelf', centerLat: 9.8000, centerLng: 75.8000, zoom: 6.8 },
  { id: 'bay-of-bengal', name: 'Bay of Bengal Deep Basin', basin: 'Bay of Bengal', centerLat: 13.5000, centerLng: 85.0000, zoom: 5.5 },
  { id: 'tamil-nadu', name: 'Tamil Nadu Coast', basin: 'Bay of Bengal Shelf', centerLat: 11.5000, centerLng: 80.5000, zoom: 6.8 },
  { id: 'lakshadweep', name: 'Lakshadweep Archipelago', basin: 'Lakshadweep Sea', centerLat: 10.5000, centerLng: 73.0000, zoom: 7.0 },
  { id: 'sri-lanka', name: 'Sri Lanka & Gulf of Mannar', basin: 'Indian Ocean', centerLat: 8.5000, centerLng: 79.5000, zoom: 6.8 },
  { id: 'indian-ocean', name: 'Equatorial Indian Ocean', basin: 'Indian Ocean Basin', centerLat: 2.0000, centerLng: 76.0000, zoom: 4.8 }
];

// 30-Day Daily Time Series Data for SST
export const mockSSTTimeSeries: TimeSeriesPoint[] = [
  { date: '01 Aug', value: 28.1, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '04 Aug', value: 28.2, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '07 Aug', value: 28.0, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '10 Aug', value: 28.3, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '13 Aug', value: 28.5, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '16 Aug', value: 28.4, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '19 Aug', value: 28.6, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '22 Aug', value: 28.8, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '25 Aug', value: 28.9, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '28 Aug', value: 28.7, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true },
  { date: '29 Aug', value: 28.95, unit: '°C', source: 'Copernicus OSTIA L4', isReal: true }
];

// 30-Day Daily Time Series Data for Chlorophyll-a
export const mockChlorophyllTimeSeries: TimeSeriesPoint[] = [
  { date: '01 Aug', value: 0.38, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '04 Aug', value: 0.41, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '07 Aug', value: 0.44, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '10 Aug', value: 0.42, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '13 Aug', value: 0.48, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '16 Aug', value: 0.51, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '19 Aug', value: 0.56, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '22 Aug', value: 0.54, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '25 Aug', value: 0.58, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '28 Aug', value: 0.55, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true },
  { date: '29 Aug', value: 0.57, unit: 'mg/m³', source: 'Copernicus BGC L4', isReal: true }
];

// 30-Day Daily Time Series Data for Wave Height (Hm0)
export const mockWaveTimeSeries: TimeSeriesPoint[] = [
  { date: '01 Aug', value: 2.1, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '04 Aug', value: 1.9, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '07 Aug', value: 2.3, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '10 Aug', value: 2.0, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '13 Aug', value: 1.8, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '16 Aug', value: 1.6, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '19 Aug', value: 1.5, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '22 Aug', value: 1.7, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '25 Aug', value: 1.4, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '28 Aug', value: 1.6, unit: 'm', source: 'Copernicus WAV L4', isReal: true },
  { date: '29 Aug', value: 1.5, unit: 'm', source: 'Copernicus WAV L4', isReal: true }
];

// 30-Day Daily Time Series Data for Sea Level Anomaly (SLA)
export const mockSLATimeSeries: TimeSeriesPoint[] = [
  { date: '01 Aug', value: 0.02, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '04 Aug', value: 0.03, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '07 Aug', value: 0.01, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '10 Aug', value: 0.04, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '13 Aug', value: 0.05, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '16 Aug', value: 0.03, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '19 Aug', value: 0.06, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '22 Aug', value: 0.05, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '25 Aug', value: 0.07, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '28 Aug', value: 0.04, unit: 'm', source: 'Copernicus DUACS L4', isReal: true },
  { date: '29 Aug', value: 0.06, unit: 'm', source: 'Copernicus DUACS L4', isReal: true }
];

// Anomaly Results
export const mockAnomalyResults: AnomalyResult[] = [
  {
    parameter: 'Sea Surface Temperature',
    currentValue: 28.95,
    baselineValue: 28.50,
    anomaly: 0.45,
    anomalyPercent: 1.58,
    unit: '°C',
    status: 'DEMO',
    classification: 'WARMING ANOMALY'
  },
  {
    parameter: 'Chlorophyll-a Concentration',
    currentValue: 0.57,
    baselineValue: 0.42,
    anomaly: 0.15,
    anomalyPercent: 35.71,
    unit: 'mg/m³',
    status: 'DEMO',
    classification: 'BLOOM ENHANCED'
  },
  {
    parameter: 'Significant Wave Height',
    currentValue: 1.50,
    baselineValue: 1.85,
    anomaly: -0.35,
    anomalyPercent: -18.92,
    unit: 'm',
    status: 'DEMO',
    classification: 'NORMAL'
  },
  {
    parameter: 'Sea Level Anomaly',
    currentValue: 0.06,
    baselineValue: 0.02,
    anomaly: 0.04,
    anomalyPercent: 200.0,
    unit: 'm',
    status: 'DEMO',
    classification: 'NORMAL'
  }
];

// Regional Comparisons
export const mockRegionalComparisons: RegionalComparisonItem[] = [
  { id: 'as', region: 'Arabian Sea Central', basin: 'Arabian Sea', currentValue: 28.95, baselineValue: 28.50, difference: 0.45, unit: '°C', status: 'DEMO' },
  { id: 'kc', region: 'Kerala Coast Shelf', basin: 'Arabian Sea', currentValue: 28.40, baselineValue: 28.10, difference: 0.30, unit: '°C', status: 'DEMO' },
  { id: 'bob', region: 'Bay of Bengal Deep', basin: 'Bay of Bengal', currentValue: 29.45, baselineValue: 28.90, difference: 0.55, unit: '°C', status: 'DEMO' },
  { id: 'tn', region: 'Tamil Nadu Coast', basin: 'Bay of Bengal', currentValue: 29.10, baselineValue: 28.80, difference: 0.30, unit: '°C', status: 'DEMO' },
  { id: 'lk', region: 'Lakshadweep Sea', basin: 'Lakshadweep', currentValue: 28.80, baselineValue: 28.60, difference: 0.20, unit: '°C', status: 'DEMO' },
  { id: 'sl', region: 'Sri Lanka Basin', basin: 'Indian Ocean', currentValue: 29.20, baselineValue: 28.90, difference: 0.30, unit: '°C', status: 'DEMO' }
];

// Cross-Source Matrix
export const mockSourceComparisonRows: SourceComparisonRow[] = [
  {
    parameterId: 'sst',
    parameterName: 'Sea Surface Temperature',
    unit: '°C',
    cells: {
      copernicus: {
        sourceId: 'copernicus',
        sourceName: 'Copernicus Marine',
        datasetName: 'OSTIA L4 NRT',
        variableName: 'analysed_sst',
        value: 28.95,
        unit: '°C',
        timestamp: '29 Aug 2026 00:00 UTC',
        quality: 'VALIDATED',
        status: 'CONNECTED',
        feedType: 'REAL DATA'
      },
      isro: {
        sourceId: 'isro',
        sourceName: 'ISRO MOSDAC',
        datasetName: 'INSAT-3DS TIR-1',
        variableName: 'sst_subskin',
        value: 29.10,
        unit: '°C',
        timestamp: '29 Aug 2026 04:30 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      incois: {
        sourceId: 'incois',
        sourceName: 'INCOIS OOS',
        datasetName: 'RAMA Moored Buoy',
        variableName: 'sst_buoy_1m',
        value: 28.80,
        unit: '°C',
        timestamp: '29 Aug 2026 06:00 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      noaa: {
        sourceId: 'noaa',
        sourceName: 'NOAA CoastWatch',
        datasetName: 'VIIRS ACSPO L3S',
        variableName: 'sea_surface_temp',
        value: 29.05,
        unit: '°C',
        timestamp: '29 Aug 2026 01:15 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      }
    }
  },
  {
    parameterId: 'chlorophyll',
    parameterName: 'Chlorophyll-a Concentration',
    unit: 'mg/m³',
    cells: {
      copernicus: {
        sourceId: 'copernicus',
        sourceName: 'Copernicus Marine',
        datasetName: 'OCEANCOLOUR BGC L4',
        variableName: 'CHL',
        value: 0.57,
        unit: 'mg/m³',
        timestamp: '29 Aug 2026 00:00 UTC',
        quality: 'VALIDATED',
        status: 'CONNECTED',
        feedType: 'REAL DATA'
      },
      isro: {
        sourceId: 'isro',
        sourceName: 'ISRO MOSDAC',
        datasetName: 'Oceansat-3 OCM-3 L2',
        variableName: 'chl_oc3',
        value: 0.54,
        unit: 'mg/m³',
        timestamp: '29 Aug 2026 04:20 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      incois: {
        sourceId: 'incois',
        sourceName: 'INCOIS Chlorophyll',
        datasetName: 'In-situ Fluorometer',
        variableName: 'fluo_chl',
        value: null,
        unit: 'mg/m³',
        timestamp: '—',
        quality: 'UNAVAILABLE',
        status: 'DEMO',
        feedType: 'UNAVAILABLE'
      },
      noaa: {
        sourceId: 'noaa',
        sourceName: 'NOAA CoastWatch',
        datasetName: 'OLCI Sentinel-3 GLO',
        variableName: 'chlor_a',
        value: 0.59,
        unit: 'mg/m³',
        timestamp: '29 Aug 2026 05:45 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      }
    }
  },
  {
    parameterId: 'waveHeight',
    parameterName: 'Significant Wave Height',
    unit: 'm',
    cells: {
      copernicus: {
        sourceId: 'copernicus',
        sourceName: 'Copernicus Marine',
        datasetName: 'GLOBAL WAV L4 NRT',
        variableName: 'VHM0',
        value: 1.50,
        unit: 'm',
        timestamp: '29 Aug 2026 00:00 UTC',
        quality: 'VALIDATED',
        status: 'CONNECTED',
        feedType: 'REAL DATA'
      },
      isro: {
        sourceId: 'isro',
        sourceName: 'ISRO MOSDAC',
        datasetName: 'AltiKa SARAL Altimeter',
        variableName: 'swh_ku',
        value: null,
        unit: 'm',
        timestamp: '—',
        quality: 'UNAVAILABLE',
        status: 'DEMO',
        feedType: 'UNAVAILABLE'
      },
      incois: {
        sourceId: 'incois',
        sourceName: 'INCOIS Coastal',
        datasetName: 'Wave Rider Buoy WRB-4',
        variableName: 'hm0_buoy',
        value: 1.62,
        unit: 'm',
        timestamp: '29 Aug 2026 07:00 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      noaa: {
        sourceId: 'noaa',
        sourceName: 'NOAA NCEP',
        datasetName: 'WaveWatch III GLO',
        variableName: 'swh',
        value: 1.48,
        unit: 'm',
        timestamp: '29 Aug 2026 03:00 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      }
    }
  },
  {
    parameterId: 'seaLevel',
    parameterName: 'Sea Level Anomaly',
    unit: 'm',
    cells: {
      copernicus: {
        sourceId: 'copernicus',
        sourceName: 'Copernicus Marine',
        datasetName: 'SEALEVEL PHY L4 NRT',
        variableName: 'sla',
        value: 0.06,
        unit: 'm',
        timestamp: '29 Aug 2026 00:00 UTC',
        quality: 'VALIDATED',
        status: 'CONNECTED',
        feedType: 'REAL DATA'
      },
      isro: {
        sourceId: 'isro',
        sourceName: 'ISRO MOSDAC',
        datasetName: 'SARAL AltiKa Track',
        variableName: 'sla_saral',
        value: 0.05,
        unit: 'm',
        timestamp: '29 Aug 2026 02:10 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      incois: {
        sourceId: 'incois',
        sourceName: 'INCOIS Tide Network',
        datasetName: 'Kochi Port Tide Gauge',
        variableName: 'tide_residual',
        value: 0.07,
        unit: 'm',
        timestamp: '29 Aug 2026 08:00 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      },
      noaa: {
        sourceId: 'noaa',
        sourceName: 'NOAA Laboratory',
        datasetName: 'JASON-3 Altimetry',
        variableName: 'sla_jason',
        value: 0.06,
        unit: 'm',
        timestamp: '29 Aug 2026 04:00 UTC',
        quality: 'DEMO',
        status: 'DEMO',
        feedType: 'MOCK FEED'
      }
    }
  }
];

export const mockDataQuality: DataQualityMetrics = {
  spatialCoveragePct: 98.4,
  temporalCompletenessPct: 99.1,
  cloudMaskedPct: 8.4,
  latencyHours: 6.2,
  processingLevel: 'L4 NRT Gap-Free Inter-calibrated',
  status: 'VALIDATED'
};
