import urllib.request
import urllib.error

url = "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst&STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png&TIME=2026-08-28T00:00:00Z"
try:
    req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Probe/1.0"})
    with urllib.request.urlopen(req, timeout=8.0) as resp:
        print(f"Copernicus Tile Status: HTTP {resp.status}, Content-Type: {resp.headers.get('Content-Type')}, Length: {len(resp.read())} bytes")
except urllib.error.HTTPError as e:
    print(f"Copernicus Tile HTTP Error: {e.code} - {e.read().decode('utf-8', errors='replace')}")
except Exception as e:
    print(f"Error: {e}")
