# Project ORCA — Backend

FastAPI-based marine intelligence backend for Project ORCA.

## Quick Start

```bash
cd backend

# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
# Edit .env with your Copernicus credentials (optional)

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

## Connect to Frontend

In the `SIH26` Next.js app, create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then restart the dev server (`npm run dev`). The frontend will automatically use real API data instead of mocks.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/ocean/point` | Point ocean observation |
| GET | `/api/v1/ocean/timeseries` | Time series at coordinates |
| GET | `/api/v1/ocean/profile` | CTD depth profile |
| GET | `/api/v1/ocean/acoustics` | Acoustic duct analysis |
| GET | `/api/v1/satellites/platforms` | Satellite platform catalog |
| GET | `/api/v1/satellites/swaths` | Orbital ground tracks |
| GET | `/api/v1/pfz/zones` | Potential Fishing Zones |
| POST | `/api/v1/pfz/evaluate` | Re-score PFZ with custom weights |
| GET | `/api/v1/analytics/timeseries` | Historical time series |
| GET | `/api/v1/analytics/anomaly` | Climatological anomaly |
| GET | `/api/v1/analytics/sources` | Multi-source comparison |
| GET | `/api/v1/command/events` | Operational alerts |
| PATCH | `/api/v1/command/events/{id}/status` | Update event workflow |
| POST | `/api/v1/agents/query` | Multi-agent AI reasoning |

## Demo Mode

Without Copernicus credentials, the backend returns **scientifically realistic demo data** with `data_status: "DEMO"` in all responses. The frontend already handles this gracefully.

## With Ollama (AI Reasoning)

```bash
# Install and start Ollama
ollama run llama3.1
```

Without Ollama, the `/api/v1/agents/query` endpoint returns a structured mock reasoning response.
