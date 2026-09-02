import urllib.request

url = (
    "https://wmts.marine.copernicus.eu/teroWmts?"
    "SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&"
    "LAYER=SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst&"
    "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&"
    "I=128&J=128&INFOFORMAT=application/json"
)

try:
    req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Probe/1.0"})
    with urllib.request.urlopen(req, timeout=10.0) as resp:
        print(f"Copernicus GetFeatureInfo Status: HTTP {resp.status}")
        print("Response sample:", resp.read().decode("utf-8", errors="replace")[:300])
except Exception as e:
    print(f"Copernicus GetFeatureInfo Error: {e}")
