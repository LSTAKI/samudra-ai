import urllib.request
import xml.etree.ElementTree as ET

url = "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Probe/1.0"})
with urllib.request.urlopen(req, timeout=12.0) as resp:
    xml_data = resp.read()

root = ET.fromstring(xml_data)
for elem in root.iter():
    if '}' in elem.tag:
        elem.tag = elem.tag.split('}', 1)[1]

targets = ["VHM0", "sla", "CHL"]
found = {}

for layer in root.findall(".//Layer"):
    ident = layer.find("Identifier")
    title = layer.find("Title")
    if ident is not None:
        ident_text = ident.text
        for t in targets:
            if t not in found and ident_text.endswith(f"/{t}"):
                found[t] = {
                    "layer": ident_text,
                    "title": title.text if title is not None else ""
                }

print("Found Copernicus Verified Layer Identifiers:")
for k, v in found.items():
    print(f"[{k}] -> {v['layer']}")
    
    # Test tile retrieval
    tile_url = f"https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={v['layer']}&STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png"
    try:
        r = urllib.request.Request(tile_url, headers={"User-Agent": "ORCA-Probe/1.0"})
        with urllib.request.urlopen(r, timeout=8.0) as resp:
            print(f"   Tile Probe: HTTP {resp.status} (Length: {len(resp.read())} bytes)")
    except Exception as e:
        print(f"   Tile Probe Error: {e}")
