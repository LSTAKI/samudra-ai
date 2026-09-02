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

for layer in root.findall(".//Layer"):
    ident = layer.find("Identifier")
    title = layer.find("Title")
    if ident is not None and ("sst" in ident.text.lower() or "analysed_sst" in ident.text.lower()):
        if "ostia" in ident.text.lower() or "010_001" in ident.text or "glo_sst" in ident.text.lower():
            print(f"MATCH: {ident.text} | Title: {title.text if title is not None else ''}")
