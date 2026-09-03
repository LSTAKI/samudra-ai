import urllib.request
import json

urls = [
    "https://ocra-y11h.onrender.com/",
    "https://ocra-y11h.onrender.com/docs",
    "https://ocra-y11h.onrender.com/openapi.json",
    "https://ocra-y11h.onrender.com/api/v1/agents/evaluate",
    "https://ocra-y11h.onrender.com/api/v1/agents/chat",
    "http://localhost:8000/openapi.json"
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print(f"[PASS] {u} -> HTTP {resp.status} ({len(data)} bytes)")
            if u.endswith("openapi.json"):
                parsed = json.loads(data.decode('utf-8'))
                print("   Paths in openapi.json:", list(parsed.get("paths", {}).keys()))
    except Exception as e:
        print(f"[FAIL] {u} -> {e}")
