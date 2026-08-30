import { PFZData } from '../../types';
import { mockPFZSectors } from '../../mock/mockPFZ';
import { apiRequest, delay } from './client';

export async function getPFZSectors(): Promise<PFZData[]> {
  try {
    return await apiRequest<PFZData[]>('/pfz/sectors');
  } catch (e) {
    await delay(180);
    return mockPFZSectors;
  }
}
