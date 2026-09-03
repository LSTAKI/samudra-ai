import urllib.request
import json

url = 'https://ocra-y11h.onrender.com/api/chat'
payload = {'message': 'What is the ocean condition near Kochi?'}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'User-Agent': 'ORCA/1.0'})

with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print('=== TOP LEVEL RESPONSE KEYS ===')
    for k, val in data.items():
        if isinstance(val, str):
            print(f' - {k}: string (len={len(val)}) -> "{val[:80]}..."')
        elif isinstance(val, dict):
            print(f' - {k}: object (keys={list(val.keys())[:10]})')
        elif isinstance(val, list):
            print(f' - {k}: list (len={len(val)})')
        else:
            print(f' - {k}: {type(val).__name__} = {val}')

print("\n=== FULL CONVERSATION_ID VALUE ===")
print("conversation_id:", data.get("conversation_id"))

print("\n=== FULL ANSWER TEXT ===")
print(data.get("answer"))
