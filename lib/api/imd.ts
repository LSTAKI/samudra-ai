import { apiRequest } from './client';

export interface IMDWeatherData {
  station_name: string;
  latitude: number;
  longitude: number;
  temperature_c?: number;
  humidity_percent?: number;
  pressure_hpa?: number;
  wind_speed_kmh?: number;
  wind_direction_deg?: number;
  rainfall_24h_mm?: number;
}

export interface IMDWeatherResponse {
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE' | 'STALE';
  source: string;
  dataset: string;
  observation_time?: string;
  retrieved_at: string;
  data: IMDWeatherData | null;
  error?: string | null;
}

export interface IMDAstronomyResponse {
  status: 'CONNECTED' | 'UNAVAILABLE';
  source: string;
  dataset: string;
  coordinates: { lat: number; lon: number };
  retrieved_at: string;
  data?: {
    sunrise?: string;
    sunset?: string;
    moonrise?: string;
    moonset?: string;
    moon_phase?: string;
  } | null;
  error?: string | null;
}

export async function fetchCurrentWeather(lat?: number, lon?: number, stationId?: string): Promise<IMDWeatherResponse> {
  try {
    const params = new URLSearchParams();
    if (stationId) params.append('station_id', stationId);
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());

    return await apiRequest<IMDWeatherResponse>(`weather/current?${params.toString()}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD',
      dataset: 'Current Weather Observation',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message || 'Unable to retrieve current weather'
    };
  }
}

export async function fetchCityForecast(stationId: string = 'kochi'): Promise<any> {
  try {
    return await apiRequest(`weather/forecast?station_id=${stationId}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD',
      dataset: '7-Day Coastal Forecast',
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message || 'Forecast feed unavailable'
    };
  }
}

export async function fetchSunMoon(lat: number = 9.9312, lon: number = 76.2673): Promise<IMDAstronomyResponse> {
  try {
    return await apiRequest<IMDAstronomyResponse>(`weather/astronomy?lat=${lat}&lon=${lon}`);
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      source: 'IMD (Positional Astronomy Centre)',
      dataset: 'Sun & Moon Ephemeris',
      coordinates: { lat, lon },
      retrieved_at: new Date().toISOString(),
      data: null,
      error: err.message
    };
  }
}
