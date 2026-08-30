import { AIMessage } from '../../types';
import { getAIResponse } from '../../mock/mockAI';
import { apiRequest, delay } from './client';

export async function askOrcaAI(
  query: string,
  coordinates?: { lat: number; lng: number }
): Promise<AIMessage> {
  try {
    return await apiRequest<AIMessage>('/ai/reasoning', {
      method: 'POST',
      body: JSON.stringify({ query, coordinates }),
    });
  } catch (e) {
    // Simulate scientific thinking latency
    await delay(1200);
    return getAIResponse(query);
  }
}
