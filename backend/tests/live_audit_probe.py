"""
ORCA Live Data Verification Probe
Executes direct live HTTP requests to configured external providers:
- IMD (India Meteorological Department)
- Copernicus Marine Service WMTS
- Open-Meteo Marine Fallback
- ISRO MOSDAC
- External Agent Gateway (Decoupled probe)
"""
import time
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

RESULTS = []

def probe_url(provider, name, url, headers=None, expected_cadence="daily"):
    start = time.time()
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    headers = headers or {"User-Agent": "ORCA-Audit-Probe/1.0", "Accept": "application/json"}
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8.0) as response:
            latency_ms = round((time.time() - start) * 1000, 1)
            body = response.read().decode("utf-8", errors="replace")
            status_code = response.status
            
            # Check if JSON
            is_json = False
            data_sample = None
            try:
                parsed = json.loads(body)
                is_json = True
                data_sample = str(parsed)[:200]
            except Exception:
                data_sample = body[:200]

            RESULTS.append({
                "provider": provider,
                "endpoint_name": name,
                "url": url,
                "http_status": status_code,
                "latency_ms": latency_ms,
                "retrieved_at": now_iso,
                "status": "REAL DATA VERIFIED",
                "auth_required": False,
                "response_type": "JSON" if is_json else "XML/Raster/Text",
                "sample": data_sample,
                "error": None
            })
    except urllib.error.HTTPError as e:
        latency_ms = round((time.time() - start) * 1000, 1)
        auth_req = e.code in [401, 403]
        RESULTS.append({
            "provider": provider,
            "endpoint_name": name,
            "url": url,
            "http_status": e.code,
            "latency_ms": latency_ms,
            "retrieved_at": now_iso,
            "status": "UNAVAILABLE" if auth_req else "ERROR",
            "auth_required": auth_req,
            "response_type": "Error",
            "sample": None,
            "error": f"HTTP {e.code}: {e.reason}"
        })
    except Exception as e:
        latency_ms = round((time.time() - start) * 1000, 1)
        RESULTS.append({
            "provider": provider,
            "endpoint_name": name,
            "url": url,
            "http_status": 0,
            "latency_ms": latency_ms,
            "retrieved_at": now_iso,
            "status": "UNAVAILABLE",
            "auth_required": False,
            "response_type": "Error",
            "sample": None,
            "error": str(e)
        })

print("Executing live network probes...")

# 1. IMD Endpoints (api.imd.gov.in)
probe_url("IMD", "Current Weather (/current_wx)", "https://api.imd.gov.in/api/v1/current_wx?lat=9.9312&lon=76.2673")
probe_url("IMD", "City Forecast (/cityforecast)", "https://api.imd.gov.in/api/v1/cityforecast?station_id=43351")
probe_url("IMD", "Port Warnings (/portwarning)", "https://api.imd.gov.in/api/v1/portwarning")
probe_url("IMD", "Daily Sea Bulletin (/seabulletin)", "https://api.imd.gov.in/api/v1/seabulletin?basin=arabian_sea")
probe_url("IMD", "Coastal Weather Bulletin (/coastalbulletin)", "https://api.imd.gov.in/api/v1/coastalbulletin?state=kerala")
probe_url("IMD", "Fishermen Sea Safety Warning", "https://api.imd.gov.in/api/v1/fishermenwarning")
probe_url("IMD", "Cyclone Track (/cyclone_track)", "https://api.imd.gov.in/api/v1/cyclone_track")
probe_url("IMD", "Cyclone Wind Radii (/cyclone_wind)", "https://api.imd.gov.in/api/v1/cyclone_wind")
probe_url("IMD", "Cyclone Cone of Uncertainty (/cyclone_cou)", "https://api.imd.gov.in/api/v1/cyclone_cou")
probe_url("IMD", "Astronomy Sun/Moon (/sunmoon)", "https://api.imd.gov.in/api/v1/sunmoon?lat=9.9312&lon=76.2673")

# 2. Copernicus Marine WMTS (wmts.marine.copernicus.eu)
probe_url("Copernicus Marine", "WMTS GetCapabilities", "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0")
probe_url("Copernicus Marine", "OSTIA SST Tile Probe (EPSG:3857, z=4, x=11, y=7)", "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst&STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png")

# 3. Open-Meteo Marine Fallback
probe_url("Open-Meteo (Marine Fallback)", "GFS Marine Current Forecast (Kochi)", "https://api.open-meteo.com/v1/forecast?latitude=9.9312&longitude=76.2673&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation&wind_speed_unit=kmh")

# 4. ISRO MOSDAC
probe_url("ISRO MOSDAC", "MOSDAC Base Endpoint", "https://mosdac.gov.in")

print(json.dumps(RESULTS, indent=2))
