import urllib.request
import json

url = "https://ocra-y11h.onrender.com/api/chat"

test_queries = [
    "What's the current ocean condition near Kochi?",
    "What's the SST on Indian Ocean",
    "Are there any marine hazards near Kochi?"
]

print("==================================================")
print("INSPECTING RAW API OBSERVATIONS & METRIC MATCHES")
print("==================================================")

for q in test_queries:
    print(f"\n--- QUERY: \"{q}\" ---")
    payload = {
        "message": q,
        "location": {
            "name": "Kochi Coast",
            "latitude": 9.9312,
            "longitude": 76.2673
        }
    }
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
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            answer = data.get("answer", {})
            print(f"HTTP Status: {resp.status}")
            print(f"Summary: {answer.get('summary')}")
            print("Observations:")
            for obs in answer.get("observations", []):
                print(f"  • {obs}")
            print(f"Sources: {[s.get('name') for s in data.get('sources', [])]}")
            print(f"Data Quality: {data.get('data_quality')}")
    except Exception as e:
        print(f"Request error for query \"{q}\": {e}")

print("==================================================")
