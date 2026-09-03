import urllib.request
import json
import time

base_url = "https://ocra-y11h.onrender.com"

print("==================================================")
print("ORCA AI CHAT BACKEND LIVE VERIFICATION")
print("==================================================")

# 1. Health check
health_url = f"{base_url}/health"
t0 = time.time()
try:
    req = urllib.request.Request(health_url, headers={"User-Agent": "ORCA-Verification/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        elapsed = round((time.time() - t0) * 1000, 1)
        assert resp.status == 200
        print(f"[PASS] Health Endpoint (/health): HTTP 200 ({elapsed}ms)")
except Exception as e:
    print(f"[FAIL] Health Endpoint (/health): {e}")

# 2. Chat POST Endpoint (/api/chat)
chat_url = f"{base_url}/api/chat"
payload = {
    "message": "What is the current ocean condition near Kochi?",
    "location": {
        "name": "Kochi Coast",
        "latitude": 9.9312,
        "longitude": 76.2673
    }
}

t0 = time.time()
try:
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        chat_url,
        data=data_bytes,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "ORCA-Verification/1.0"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        elapsed = round((time.time() - t0) * 1000, 1)
        assert resp.status == 200
        res_data = json.loads(resp.read().decode('utf-8'))
        
        # Verify contract fields
        assert "conversation_id" in res_data
        assert "answer" in res_data
        answer = res_data.get("answer", {})
        assert "summary" in answer or "observations" in answer
        
        print(f"[PASS] Live Chat Endpoint (POST /api/chat): HTTP 200 ({elapsed}ms)")
        print(f"       Conversation ID: {res_data.get('conversation_id')}")
        print(f"       Summary: {answer.get('summary')[:120]}...")
        print(f"       Observations Count: {len(answer.get('observations', []))}")
        print(f"       Sources Count: {len(res_data.get('sources', []))}")
except Exception as e:
    print(f"[FAIL] Live Chat Endpoint (POST /api/chat): {e}")

print("==================================================")
