import { SafetyAlert } from '../../types';
import { mockSafetyAlerts, mockEEZBoundary, mockIMBLBoundary, mockIMBLWarningBuffer } from '../../mock/mockPFZ';
import { apiRequest, delay } from './client';

export interface SafetyZones {
  eez: [number, number][];
  imbl: [number, number][];
  imblBuffer: [number, number][];
}

export async function getSafetyAlerts(): Promise<SafetyAlert[]> {
  try {
    return await apiRequest<SafetyAlert[]>('/safety/alerts');
  } catch (e) {
    await delay(120);
    return mockSafetyAlerts;
  }
}

export async function getSafetyBoundaries(): Promise<SafetyZones> {
  try {
    return await apiRequest<SafetyZones>('/safety/boundaries');
  } catch (e) {
    await delay(150);
    return {
      eez: mockEEZBoundary as [number, number][],
      imbl: mockIMBLBoundary as [number, number][],
      imblBuffer: mockIMBLWarningBuffer as [number, number][]
    };
  }
}
