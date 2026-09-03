import urllib.request
import json
import time

base_url = "https://ocra-y11h.onrender.com"

print("==================================================")
print("ORCA AI CHAT LIFECYCLE & CONTINUITY VERIFICATION")
print("==================================================")

# 1. Health check
health_url = f"{base_url}/health"
t0 = time.time()
try:
    req = urllib.request.Request(health_url, headers={"User-Agent": "Mozilla/5.0", "Origin": "http://localhost:3000"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        elapsed = round((time.time() - t0) * 1000, 1)
        assert resp.status == 200
        print(f"[PASS 1] GET /health: HTTP 200 ({elapsed}ms)")
except Exception as e:
    print(f"[FAIL 1] GET /health: {e}")

# 2. First Chat POST (no conversation_id sent initially)
chat_url = f"{base_url}/api/chat"
payload1 = {
    "message": "What's the current ocean condition near Kochi?",
    "conversation_id": None,
    "location": {
        "name": "Kochi Coast",
        "latitude": 9.9312,
        "longitude": 76.2673
    }
}

returned_conv_id = None
t0 = time.time()
try:
    data_bytes = json.dumps(payload1).encode('utf-8')
    req = urllib.request.Request(
        chat_url,
        data=data_bytes,
        headers={
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        elapsed = round((time.time() - t0) * 1000, 1)
        assert resp.status == 200
        res1 = json.loads(resp.read().decode('utf-8'))
        returned_conv_id = res1.get("conversation_id")
        assert returned_conv_id is not None
        
        answer1 = res1.get("answer", {})
        print(f"[PASS 2] POST /api/chat (Initial Message): HTTP 200 ({elapsed}ms)")
        print(f"         Backend Returned conversation_id: {returned_conv_id}")
        print(f"         Summary: {answer1.get('summary')[:100]}...")
        print(f"         Observations ({len(answer1.get('observations', []))} items): {answer1.get('observations', [])[:1]}")
        print(f"         Sources ({len(res1.get('sources', []))} items): {[s.get('name') for s in res1.get('sources', [])[:2]]}")
except Exception as e:
    print(f"[FAIL 2] POST /api/chat (Initial Message): {e}")

# Wait 2 seconds before follow-up
time.sleep(2)

# 3. Follow-up Chat POST sending the SAME returned_conv_id
if returned_conv_id:
    payload2 = {
        "message": "Are there any active weather alerts for fishermen today?",
        "conversation_id": returned_conv_id,
        "location": {
            "name": "Kochi Coast",
            "latitude": 9.9312,
            "longitude": 76.2673
        }
    }
    
    t0 = time.time()
    try:
        data_bytes = json.dumps(payload2).encode('utf-8')
        req = urllib.request.Request(
            chat_url,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
                "User-Agent": "Mozilla/5.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            res2 = json.loads(resp.read().decode('utf-8'))
            conv_id_2 = res2.get("conversation_id")
            
            assert conv_id_2 == returned_conv_id
            answer2 = res2.get("answer", {})
            print(f"[PASS 3] POST /api/chat (Follow-up Continuity): HTTP 200 ({elapsed}ms)")
            print(f"         Reused conversation_id Matched: {conv_id_2}")
            print(f"         Summary: {answer2.get('summary')[:100]}...")
    except Exception as e:
        print(f"[FAIL 3] POST /api/chat (Follow-up Continuity): {e}")
else:
    print("[SKIP 3] Cannot test follow-up continuity because initial request failed.")

print("==================================================")
