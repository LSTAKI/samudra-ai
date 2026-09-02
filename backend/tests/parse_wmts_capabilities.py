import urllib.request
import xml.etree.ElementTree as ET

url = "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Probe/1.0"})
with urllib.request.urlopen(req, timeout=12.0) as resp:
    xml_data = resp.read()

root = ET.fromstring(xml_data)
# Strip namespace
for elem in root.iter():
    if '}' in elem.tag:
        elem.tag = elem.tag.split('}', 1)[1]

layers = []
for layer in root.findall(".//Layer"):
    ident = layer.find("Identifier")
    title = layer.find("Title")
    if ident is not None:
        layers.append({
            "identifier": ident.text,
            "title": title.text if title is not None else ""
        })

print(f"Total layers in Copernicus Marine WMTS: {len(layers)}")
print("Sample SST / Wave / Chl layers:")
for l in layers[:25]:
    print(f"- {l['identifier']} : {l['title']}")
