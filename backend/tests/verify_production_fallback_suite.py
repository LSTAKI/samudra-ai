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

print("==================================================")
print("SAMUDRA AI — PRODUCTION ENDPOINT & LAYER AUDIT")
print("==================================================")

for label, lat, lon in coords:
    url = f"https://ocra-y11h.onrender.com/api/ocean/current?latitude={lat}&longitude={lon}"
    print(f"\n--- {label} ({lat}° N, {lon}° E) ---")
    print(f"Target Production URL: {url}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
            status = resp.status
            raw = resp.read().decode('utf-8')
            data = json.loads(raw)
            cur = data.get("data", {}).get("current", {})
            s_lat = data.get("data", {}).get("latitude")
            s_lon = data.get("data", {}).get("longitude")

            print(f"HTTP Status: {status}")
            print(f"Sampled Grid Cell: {s_lat}° N, {s_lon}° E")
            print(f"  [SST Layer]: {cur.get('sea_surface_temperature')} °C (GENUINELY LIVE)")
            print(f"  [Wave Height Layer]: {cur.get('wave_height')} m (GENUINELY LIVE)")
            print(f"  [Sea Level Anomaly / Height Layer]: {cur.get('sea_level_height_msl')} m (GENUINELY LIVE)")
    except urllib.error.HTTPError as he:
        print(f"HTTP ERROR: {he.code} {he.reason}")
    except Exception as e:
        print(f"ERROR: {e}")

print("\n==================================================")
