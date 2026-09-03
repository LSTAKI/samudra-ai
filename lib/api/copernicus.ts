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
  sampling_method?: 'EXACT_GRID_POINT' | 'NEAREST_OCEAN_CELL' | 'NO_DATA';
  sampling_distance_km?: number;
  is_fallback?: boolean;
  source_type?: 'WMTS_FEATURE_INFO' | 'LIVE_OCEAN_CURRENT';
  value: number | null;
  unit: string;
  spatial_resolution?: string;
  temporal_resolution?: string;
  observation_timestamp: string;
  retrieved_at: string;
  is_cached?: boolean;
  error?: string | null;
}

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lon1 - lon2) < 0.0001) {
    return 0.0;
  }
  const R = 6371.0;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = rad(lat1);
  const phi2 = rad(lat2);
  const dphi = rad(lat2 - lat1);
  const dlambda = rad(lon2 - lon1);

  const a =
    Math.sin(dphi / 2) * Math.sin(dphi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
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
    // If ocean/feature-info is not mounted on remote backend (404), query Render /api/ocean/current live endpoint
    try {
      const renderBase = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://ocra-y11h.onrender.com';
      const curUrl = `${renderBase.replace(/\/+$/, '')}/api/ocean/current?latitude=${lat}&longitude=${lon}`;
      const resp = await fetch(curUrl, { headers: { 'Accept': 'application/json' } });
      if (resp.ok) {
        const json = await resp.json();
        const curData = json?.data?.current;
        const rawLat = json?.data?.latitude ?? lat;
        const rawLon = json?.data?.longitude ?? lon;
        const sLat = Number(rawLat.toFixed(4));
        const sLon = Number(rawLon.toFixed(4));
        const distKm = calculateHaversineDistance(lat, lon, sLat, sLon);
        const samplingMethod = distKm > 0.1 ? 'NEAREST_OCEAN_CELL' : 'EXACT_GRID_POINT';

        let val: number | null = null;
        if (layerId === 'copernicus-sst' && typeof curData?.sea_surface_temperature === 'number') {
          val = curData.sea_surface_temperature;
        } else if (layerId === 'copernicus-wave' && typeof curData?.wave_height === 'number') {
          val = curData.wave_height;
        } else if (layerId === 'copernicus-sla' && typeof curData?.sea_level_height_msl === 'number') {
          val = curData.sea_level_height_msl;
        }

        if (val !== null) {
          return {
            status: 'CONNECTED',
            source: layerDef?.provider || 'Copernicus Marine Service',
            product_id: layerDef?.product || 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
            dataset_id: layerDef?.dataset || 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
            variable: layerDef?.variable || 'analysed_sst',
            latitude: lat,
            longitude: lon,
            sampled_latitude: sLat,
            sampled_longitude: sLon,
            sampling_method: samplingMethod,
            sampling_distance_km: distKm,
            is_fallback: true,
            source_type: 'LIVE_OCEAN_CURRENT',
            value: val,
            unit: layerDef?.units || '',
            observation_timestamp: curData?.time ? `${curData.time}:00Z` : (time || new Date().toISOString()),
            retrieved_at: new Date().toISOString()
          };
        }
      }
    } catch {
      // Fall through to UNAVAILABLE envelope
    }

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
    // If ocean/timeseries is not mounted on remote backend (404), query Render /api/ocean/current live hourly endpoint
    try {
      const renderBase = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://ocra-y11h.onrender.com';
      const curUrl = `${renderBase.replace(/\/+$/, '')}/api/ocean/current?latitude=${lat}&longitude=${lon}`;
      const resp = await fetch(curUrl, { headers: { 'Accept': 'application/json' } });
      if (resp.ok) {
        const json = await resp.json();
        const hourly = json?.data?.hourly;
        const times: string[] = hourly?.time || [];

        let vals: (number | null)[] = [];
        let unit = '';

        if (datasetKey === 'copernicus-sst' && Array.isArray(hourly?.sea_surface_temperature)) {
          vals = hourly.sea_surface_temperature;
          unit = '°C';
        } else if (datasetKey === 'copernicus-wave' && Array.isArray(hourly?.wave_height)) {
          vals = hourly.wave_height;
          unit = 'm';
        } else if (datasetKey === 'copernicus-sla' && Array.isArray(hourly?.sea_level_height_msl)) {
          vals = hourly.sea_level_height_msl;
          unit = 'm';
        }

        if (times.length > 0 && vals.length > 0) {
          const stepSize = Math.max(1, Math.floor(times.length / steps));
          const records = [];
          for (let i = 0; i < times.length && records.length < steps; i += stepSize) {
            const val = typeof vals[i] === 'number' ? vals[i] : null;
            records.push({
              timestamp: `${times[i]}:00Z`,
              value: val,
              unit,
              status: (val !== null ? 'VALID' : 'NO_DATA') as 'VALID' | 'NO_DATA'
            });
          }

          const validRecs = records.filter(r => r.value !== null);

          if (validRecs.length > 0) {
            return {
              status: 'CONNECTED',
              source: 'Copernicus / Open-Meteo Live API',
              product_id: datasetKey.toUpperCase(),
              dataset_id: datasetKey,
              variable: datasetKey,
              units: unit,
              coordinates: { latitude: lat, longitude: lon },
              time_range: {
                start: records[0]?.timestamp || '',
                end: records[records.length - 1]?.timestamp || ''
              },
              count: validRecs.length,
              total_requested: records.length,
              first_observation: validRecs[0]?.timestamp || null,
              last_observation: validRecs[validRecs.length - 1]?.timestamp || null,
              records,
              retrieved_at: new Date().toISOString(),
              is_cached: false
            };
          }
        }
      }
    } catch {
      // Fall through to UNAVAILABLE envelope
    }

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
