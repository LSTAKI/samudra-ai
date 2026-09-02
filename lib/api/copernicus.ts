/**
 * Dedicated Copernicus Marine API Client
 */
import { apiRequest } from './client';
import { OceanLayerDefinition, getLayerById } from '../map/layerRegistry';

export interface CopernicusCatalogResponse {
  status: 'CONNECTED' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE';
  source: string;
  retrieved_at: string;
  datasets_count: number;
  datasets: OceanLayerDefinition[];
}

export interface CopernicusFeatureInfoResponse {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE' | 'NO_DATA';
  source: string;
  product_id: string;
  dataset_id: string;
  variable: string;
  latitude: number;
  longitude: number;
  sampled_latitude?: number;
  sampled_longitude?: number;
  sampling_method?: 'EXACT_GRID_POINT' | 'NEAREST_OCEAN_CELL';
  value: number | null;
  unit: string;
  spatial_resolution?: string;
  temporal_resolution?: string;
  observation_timestamp: string;
  retrieved_at: string;
  is_cached?: boolean;
  error?: string | null;
}

export interface CopernicusSpatialSummaryResponse {
  status: 'CONNECTED' | 'UNAVAILABLE';
  source: string;
  product_id: string;
  dataset_id: string;
  variable: string;
  units: string;
  bbox: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  observation_timestamp: string;
  retrieved_at: string;
  count: number;
  statistics: {
    min: number;
    max: number;
    mean: number;
  } | null;
  is_cached?: boolean;
}

export interface CopernicusTimeseriesResponse {
  status: 'CONNECTED' | 'NO_DATA' | 'UNAVAILABLE';
  source: string;
  product_id: string;
  dataset_id: string;
  variable: string;
  units: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  time_range: {
    start: string;
    end: string;
  };
  count: number;
  total_requested: number;
  first_observation: string | null;
  last_observation: string | null;
  records: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    status: 'VALID' | 'NO_DATA';
  }>;
  retrieved_at: string;
  is_cached: boolean;
}

export async function fetchCopernicusCatalog(): Promise<CopernicusCatalogResponse> {
  try {
    return await apiRequest<CopernicusCatalogResponse>('ocean/catalog');
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'Copernicus Marine Service',
      retrieved_at: new Date().toISOString(),
      datasets_count: 0,
      datasets: []
    };
  }
}

export async function fetchCopernicusFeatureInfo(
  layerId: string,
  lat: number,
  lon: number,
  time?: string
): Promise<CopernicusFeatureInfoResponse> {
  const layerDef = getLayerById(layerId);
  try {
    const params = new URLSearchParams({
      layer_id: layerId,
      lat: lat.toString(),
      lon: lon.toString()
    });
    if (time) params.append('time', time);

    return await apiRequest<CopernicusFeatureInfoResponse>(`ocean/feature-info?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: layerDef?.provider || 'Copernicus Marine Service',
      product_id: layerDef?.product || 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
      dataset_id: layerDef?.dataset || 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
      variable: layerDef?.variable || 'analysed_sst',
      latitude: lat,
      longitude: lon,
      value: null,
      unit: layerDef?.units || '',
      observation_timestamp: time || '2026-08-28T00:00:00Z',
      retrieved_at: new Date().toISOString(),
      error: err.message || 'Feature info query failed'
    };
  }
}

export async function fetchCopernicusTimeseries(
  datasetKey: string = 'copernicus-sst',
  lat: number = 9.9312,
  lon: number = 76.2673,
  startTime?: string,
  endTime?: string,
  steps: number = 5
): Promise<CopernicusTimeseriesResponse> {
  try {
    const params = new URLSearchParams({
      dataset_key: datasetKey,
      lat: lat.toString(),
      lon: lon.toString(),
      steps: steps.toString()
    });
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);

    return await apiRequest<CopernicusTimeseriesResponse>(`ocean/timeseries?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'Copernicus Marine Service',
      product_id: 'UNKNOWN',
      dataset_id: 'UNKNOWN',
      variable: 'UNKNOWN',
      units: '',
      coordinates: { latitude: lat, longitude: lon },
      time_range: { start: '', end: '' },
      count: 0,
      total_requested: steps,
      first_observation: null,
      last_observation: null,
      records: [],
      retrieved_at: new Date().toISOString(),
      is_cached: false
    };
  }
}

export async function fetchCopernicusSpatialSummary(
  datasetKey: string,
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  time?: string
): Promise<CopernicusSpatialSummaryResponse | null> {
  try {
    const params = new URLSearchParams({
      dataset_key: datasetKey,
      min_lat: minLat.toString(),
      max_lat: maxLat.toString(),
      min_lon: minLon.toString(),
      max_lon: maxLon.toString()
    });
    if (time) params.append('time', time);

    return await apiRequest<CopernicusSpatialSummaryResponse>(`ocean/spatial-summary?${params.toString()}`);
  } catch {
    return null;
  }
}
