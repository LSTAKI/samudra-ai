/**
 * ORCA AI Chat API Client
 * Connects directly to the deployed ORCA Marine Intelligence REST API at https://ocra-y11h.onrender.com/
 */

export const CHAT_API_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://ocra-y11h.onrender.com';

export interface LocationInput {
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ChatRequestPayload {
  message: string;
  conversation_id?: string | null;
  location?: LocationInput | null;
}

export interface ChatAnswer {
  status?: string;
  summary?: string;
  observations?: string[];
  recommendations?: string[];
}

export interface ChatSource {
  name?: string;
  title?: string;
  url?: string;
  type?: string;
  confidence?: number;
  note?: string | null;
}

export interface ChatEvidence {
  id?: string;
  title?: string;
  source?: string;
  url?: string;
  type?: string;
  parameters?: string[];
  timestamp?: string | null;
  confidence?: number;
  note?: string | null;
}

export interface ChatHazard {
  name?: string;
  status?: string;
  severity?: string;
  source?: string;
  source_url?: string;
  timestamp?: string | null;
  details?: string | null;
}

export interface ChatResponseData {
  request_id?: string;
  conversation_id?: string;
  language?: string;
  location?: LocationInput;
  intent?: Record<string, any>;
  answer?: ChatAnswer;
  ocean?: Record<string, any>;
  weather?: Record<string, any>;
  pfz?: any[];
  hazards?: ChatHazard[];
  geofencing?: any[];
  route?: any;
  productivity?: Record<string, any>;
  data_quality?: Record<string, any>;
  evidence?: ChatEvidence[];
  sources?: ChatSource[];
  map?: {
    center?: { latitude?: number; longitude?: number };
    markers?: Array<{ type?: string; latitude?: number; longitude?: number; label?: string }>;
    route?: any[];
    layers?: string[];
  };
}

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DEGRADED' | 'ERROR';

export interface ChatBackendHealth {
  status: ConnectionStatus;
  latencyMs?: number;
  message?: string;
}

/**
  * Checks health connection to the deployed ORCA Chat backend.
  */
export async function checkChatBackendHealth(): Promise<ChatBackendHealth> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${CHAT_API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (response.ok) {
      return {
        status: latencyMs > 3000 ? 'DEGRADED' : 'CONNECTED',
        latencyMs,
        message: 'ORCA Intelligence Engine Online'
      };
    } else {
      return {
        status: 'DEGRADED',
        latencyMs,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 'ERROR',
      latencyMs,
      message: err?.name === 'AbortError' ? 'Health check timed out' : (err?.message || 'Connection failed')
    };
  }
}

/**
  * Sends a chat prompt to the deployed POST /api/chat backend endpoint.
  */
export async function sendChatMessage(
  payload: ChatRequestPayload,
  signal?: AbortSignal
): Promise<ChatResponseData> {
  const url = `${CHAT_API_BASE_URL.replace(/\/+$/, '')}/api/chat`;

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
        }
      }
    } catch {
      // Use fallback errorDetail
    }
    throw new Error(errorDetail);
  }

  const data: ChatResponseData = await response.json();
  return data;
}
