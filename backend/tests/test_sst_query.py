import urllib.request
import json
import time

url = "https://ocra-y11h.onrender.com/api/chat"
payload = {
    "message": "What's the SST on Indian Ocean",
    "location": {
        "name": "Kochi Coast",
        "latitude": 9.9312,
        "longitude": 76.2673
    }
}

print("Sending request:", json.dumps(payload, indent=2))
t0 = time.time()

try:
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=40) as resp:
        elapsed = round((time.time() - t0) * 1000, 1)
        print(f"HTTP Status: {resp.status} ({elapsed}ms)")
        res_json = json.loads(resp.read().decode('utf-8'))
        print("Response JSON:")
        print(json.dumps(res_json, indent=2))
except Exception as e:
    print(f"Error: {e}")
