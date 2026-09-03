import urllib.request
import json

url = "https://ocra-y11h.onrender.com/api/chat"

test_payloads = [
    ("Message only", {"message": "Hello ORCA"}),
    ("Message + conv_id", {"message": "Hello ORCA", "conversation_id": "conv_12345"}),
    ("Message + conv_id null", {"message": "Hello ORCA", "conversation_id": None}),
    ("Message + location null", {"message": "Hello ORCA", "location": None}),
    ("Message + location dict", {
        "message": "Hello ORCA",
        "conversation_id": None,
        "location": {
            "name": "Kochi Coast",
            "latitude": 9.9312,
            "longitude": 76.2673
        }
    })
]

for name, payload in test_payloads:
    print(f"\n=== Testing Payload: {name} ===")
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Origin": "http://localhost:3000",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"  [PASS] Status: {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"  [FAIL] HTTP Error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
