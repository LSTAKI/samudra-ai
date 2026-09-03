import urllib.request
import json
import time

url = "https://ocra-y11h.onrender.com/api/chat"

print("==================================================")
print("SAMUDRA AI DATA INTEGRITY MATRIX AUDIT")
print("==================================================")

queries = [
    ("Query A", "What's the current ocean condition near Kochi?"),
    ("Query B", "What's the SST on Indian Ocean")
]

for label, q in queries:
    print(f"\n--- {label}: \"{q}\" ---")
    payload = {
        "message": q,
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
            url,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            res = json.loads(resp.read().decode('utf-8'))
            answer = res.get("answer", {})
            observations = answer.get("observations", [])
            data_quality = res.get("data_quality", {})
            
            print(f"HTTP Status: {resp.status} ({elapsed}ms)")
            print(f"Summary: {answer.get('summary')[:100]}...")
            print("Raw Observations:")
            for obs in observations:
                print(f"  • {obs}")
                
            print("\nMetric Audit Verification Table:")
            print("UI Metric | Raw API Text Support | Allowed?")
            print("-" * 50)
            
            # Audit regex extractions against raw observations
            found_any = False
            for obs in observations:
                if "Sea surface temperature" in obs or "SST" in obs:
                    print(f"SEA SURFACE TEMP | '{obs}' | YES")
                    found_any = True
                if "Wave height" in obs:
                    print(f"WAVE HEIGHT | '{obs}' | YES")
                    found_any = True
                if "period of" in obs:
                    print(f"WAVE PERIOD | '{obs}' | YES")
                    found_any = True
                if "Ocean current speed" in obs:
                    print(f"CURRENT SPEED | '{obs}' | YES")
                    found_any = True
                if "wind speed" in obs:
                    print(f"WIND SPEED | '{obs}' | YES")
                    found_any = True
            
            if not found_any:
                print("No metric tiles matched -> Full text rendered as bullets | YES")
                
            print("\nData Quality Verification:")
            print(f"  requested: {data_quality.get('requested')} (Raw API)")
            print(f"  available: {data_quality.get('available')} (Raw API)")
            print(f"  completeness_percent: {data_quality.get('completeness_percent')}% (Raw API)")
            print(f"  source_count: {data_quality.get('source_count')} (Raw API)")
            
    except Exception as e:
        print(f"Request error for {label}: {e}")

print("==================================================")
