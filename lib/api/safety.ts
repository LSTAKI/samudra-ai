import { SafetyAlert } from '../../types';
import { eezBoundaryCoordinates, imblBoundaryCoordinates, imblWarningBufferCoordinates } from '../map/maritimeBoundaries';
import { apiRequest } from './client';

export interface SafetyZones {
  eez: [number, number][];
  imbl: [number, number][];
  imblBuffer: [number, number][];
}

export async function getSafetyAlerts(): Promise<SafetyAlert[]> {
  try {
    return await apiRequest<SafetyAlert[]>('/safety/alerts');
  } catch {
    // Return honest empty state without artificial delays or fabricated alerts
    return [];
  }
}

export async function getSafetyBoundaries(): Promise<SafetyZones> {
  return {
    eez: eezBoundaryCoordinates,
    imbl: imblBoundaryCoordinates,
    imblBuffer: imblWarningBufferCoordinates
  };
}
