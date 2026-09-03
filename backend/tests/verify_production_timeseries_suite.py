import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

coords = [
    ("Arabian Sea", 10.0000, 70.0000),
    ("Kochi Coast", 9.9312, 76.2673),
    ("Bay of Bengal", 15.0000, 82.0000),
]

layers = [
    ("copernicus-sst", "SST"),
    ("copernicus-wave", "Wave Height"),
    ("copernicus-chl", "Chlorophyll-a"),
    ("copernicus-sla", "Sea Level Anomaly"),
]

print("==================================================")
print("SAMUDRA AI — PRODUCTION TIMESERIES AUDIT")
print("==================================================")

for label, lat, lon in coords:
    print(f"\n=== {label} ({lat}° N, {lon}° E) ===")
    for key, name in layers:
        url = f"https://ocra-y11h.onrender.com/api/ocean/current?latitude={lat}&longitude={lon}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                status = resp.status
                data = json.loads(resp.read().decode('utf-8'))
                hourly = data.get("data", {}).get("hourly", {})
                times = hourly.get("time", [])

                vals = []
                if key == "copernicus-sst":
                    vals = hourly.get("sea_surface_temperature", [])
                elif key == "copernicus-wave":
                    vals = hourly.get("wave_height", [])
                elif key == "copernicus-sla":
                    vals = hourly.get("sea_level_height_msl", [])

                valid_vals = [v for v in vals if v is not None]
                if len(valid_vals) > 0:
                    print(f"  [{name}]: HTTP {status} | {len(valid_vals)} records | Times: {times[0]} to {times[-1]} | Values: {valid_vals[:3]}...")
                else:
                    print(f"  [{name}]: HTTP {status} | NO DATA (0 valid records)")
        except Exception as e:
            print(f"  [{name}]: ERROR {e}")

print("\n==================================================")
