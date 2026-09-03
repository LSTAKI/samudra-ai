import urllib.request
import json

url = "https://ocra-y11h.onrender.com/api/chat"

test_payloads = [
    {
        "message": "What's the current ocean condition near Kochi?"
    },
    {
        "message": "Show me the latest available SST information.",
        "location": {
            "name": "Kochi Coast",
            "latitude": 9.9312,
            "longitude": 76.2673
        }
    },
    {
        "message": "Is there any cyclone activity near Kerala?",
        "conversation_id": "test-conv-123"
    }
]

for i, payload in enumerate(test_payloads, 1):
    print(f"\n=== TEST PAYLOAD {i} ===")
    print("Sending:", json.dumps(payload, indent=2))
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'ORCA-Tester/1.0'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.status
            res_body = resp.read().decode('utf-8')
            print(f"HTTP Status: {status}")
            try:
                res_json = json.loads(res_body)
                print("Response JSON:")
                print(json.dumps(res_json, indent=2))
            except Exception:
                print("Response raw text:", res_body[:500])
    except Exception as e:
        print(f"Error sending request: {e}")
