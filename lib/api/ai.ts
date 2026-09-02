/**
 * AI Reasoning Gateway Client
 * Note: Multi-agent reasoning intelligence is decoupled from this operational platform.
 */
import { AIMessage } from '../../types';
import { queryAgentPlatform } from './agents';

export async function askOrcaAI(
  query: string,
  coordinates?: { lat: number; lng: number }
): Promise<AIMessage> {
  const res = await queryAgentPlatform(query, coordinates);
  if (res && res.status === 'CONNECTED' && res.response) {
    return res.response;
  }

  return {
    id: `msg-${Date.now()}`,
    question: query,
    analysis: 'The multi-agent reasoning intelligence platform is hosted separately and is currently not connected to this operational data terminal. Configure AGENT_PLATFORM_URL to link the external multi-agent platform.',
    dataEvidence: [
      { sensor: 'Gateway', value: 'External Multi-Agent System Decoupled' }
    ],
    confidence: 'LOW',
    provenance: [
      {
        source: 'External Agent Gateway (Decoupled)',
        dataset: 'System Architecture Specification',
        coordinates: coordinates ? `${coordinates.lat.toFixed(3)}°N, ${coordinates.lng.toFixed(3)}°E` : 'Global',
        timestamp: new Date().toISOString(),
        processing: 'Decoupled Interface Probe',
        validation: 'Verified Standalone Operational Mode',
        confidence: 'LOW'
      }
    ]
  };
}
