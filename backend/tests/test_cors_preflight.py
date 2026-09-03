import urllib.request
import json

base_url = "https://ocra-y11h.onrender.com"

print("==================================================")
print("TESTING CORS PREFLIGHT & HEADERS FOR DEPLOYED BACKEND")
print("==================================================")

# 1. Test OPTIONS preflight for /api/chat
preflight_req = urllib.request.Request(
    f"{base_url}/api/chat",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
        "User-Agent": "Mozilla/5.0"
    },
    method="OPTIONS"
)

try:
    with urllib.request.urlopen(preflight_req, timeout=10) as resp:
        print(f"[PREFLIGHT OPTIONS /api/chat] Status: {resp.status}")
        print("Response Headers:")
        for k, v in resp.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
except Exception as e:
    print(f"[PREFLIGHT OPTIONS /api/chat FAIL] {e}")

# 2. Test GET /health with Origin
health_req = urllib.request.Request(
    f"{base_url}/health",
    headers={
        "Origin": "http://localhost:3000",
        "User-Agent": "Mozilla/5.0"
    },
    method="GET"
)

try:
    with urllib.request.urlopen(health_req, timeout=10) as resp:
        print(f"\n[GET /health] Status: {resp.status}")
        print("Response Headers:")
        for k, v in resp.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
except Exception as e:
    print(f"[GET /health FAIL] {e}")

# 3. Test POST /api/chat with Origin
chat_payload = json.dumps({"message": "Hello ORCA"}).encode("utf-8")
chat_req = urllib.request.Request(
    f"{base_url}/api/chat",
    data=chat_payload,
    headers={
        "Origin": "http://localhost:3000",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(chat_req, timeout=30) as resp:
        print(f"\n[POST /api/chat] Status: {resp.status}")
        print("Response Headers:")
        for k, v in resp.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
except Exception as e:
    print(f"[POST /api/chat FAIL] {e}")

print("==================================================")
