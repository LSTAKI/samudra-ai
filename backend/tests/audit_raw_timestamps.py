import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://ocra-y11h.onrender.com/api/ocean/current?latitude=9.9312&longitude=76.2673"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    hourly = data.get("data", {}).get("hourly", {})
    times = hourly.get("time", [])
    url_source = data.get("url", "")
    
    print("==================================================")
    print("RAW TIMESTAMP & SOURCE AUDIT")
    print("==================================================")
    print(f"Raw API URL Source: {url_source}")
    print(f"First raw timestamp string: '{times[0]}'")
    print(f"Last raw timestamp string:  '{times[-1]}'")
    print(f"Total hourly timesteps: {len(times)}")
    print("==================================================")
