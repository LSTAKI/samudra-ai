import urllib.request
import json

url = "https://ocra-y11h.onrender.com/openapi.json"
print("Fetching OpenAPI spec from deployed backend...")

try:
    req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Inspector/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("OpenAPI Title:", data.get("info", {}).get("title"))
        print("OpenAPI Version:", data.get("info", {}).get("version"))
        print("\n=== ENDPOINTS FOUND ===")
        for path, methods in data.get("paths", {}).items():
            for method, details in methods.items():
                print(f"{method.upper()} {path} -> summary: {details.get('summary')}")
                if 'requestBody' in details:
                    print("  RequestBody:", json.dumps(details['requestBody'], indent=4))
                if 'responses' in details:
                    print("  Responses:", json.dumps(details['responses'], indent=4))
        print("\n=== SCHEMAS ===")
        print(json.dumps(data.get("components", {}).get("schemas", {}), indent=2))
except Exception as e:
    print("Failed to fetch OpenAPI spec:", e)
