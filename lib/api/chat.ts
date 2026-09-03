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
 * Uses /health endpoint with fallback to / root endpoint.
 */
export async function checkChatBackendHealth(): Promise<ChatBackendHealth> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response = await fetch(`${CHAT_API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => null);

    // Fallback to root endpoint if /health fetch failed
    if (!response || !response.ok) {
      response = await fetch(`${CHAT_API_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }).catch(() => null);
    }

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (response && response.ok) {
      const result: ChatBackendHealth = {
        status: latencyMs > 5000 ? 'DEGRADED' : 'CONNECTED',
        latencyMs,
        message: 'Samudra AI Intelligence Engine Online'
      };
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ORCA HEALTH DEBUG]', result);
      }
      return result;
    } else {
      const statusText = response ? `HTTP ${response.status}` : 'No Response';
      const result: ChatBackendHealth = {
        status: 'DEGRADED',
        latencyMs,
        message: `Backend Warning: ${statusText}`
      };
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[ORCA HEALTH WARNING]', result);
      }
      return result;
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    const result: ChatBackendHealth = {
      status: 'ERROR',
      latencyMs,
      message: err?.name === 'AbortError' ? 'Health check timed out' : (err?.message || 'Connection failed')
    };
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ORCA HEALTH ERROR]', result);
    }
    return result;
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

  // Guarantee location object to satisfy backend validation
  const locationPayload: LocationInput = (payload.location && (payload.location.name || payload.location.latitude))
    ? payload.location
    : {
        name: 'Kochi Coast',
        latitude: 9.9312,
        longitude: 76.2673
      };

  const bodyData: ChatRequestPayload = {
    message: payload.message,
    conversation_id: payload.conversation_id || null,
    location: locationPayload
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[ORCA CHAT REQUEST]', url, bodyData);
  }

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    if (response.status === 502 || response.status === 520 || response.status === 504) {
      errorDetail = `Samudra AI Service Gateway Busy (HTTP ${response.status}). Render free-tier backend is spinning up or reloading upstream feeds. Please click retry.`;
    } else {
      try {
        const errJson = await response.json();
        if (errJson?.detail) {
          if (typeof errJson.detail === 'string') {
            errorDetail = errJson.detail;
          } else if (Array.isArray(errJson.detail)) {
            errorDetail = errJson.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
          } else if (typeof errJson.detail === 'object') {
            errorDetail = JSON.stringify(errJson.detail);
          }
        }
      } catch {
        // Use fallback errorDetail
      }
    }
    throw new Error(errorDetail);
  }

  const data: ChatResponseData = await response.json();

  if (process.env.NODE_ENV !== 'production') {
    console.log('[ORCA CHAT RESPONSE]', data);
  }

  return data;
}
