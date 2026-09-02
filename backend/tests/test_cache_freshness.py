"""
Cache & Freshness Audit Probe
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.cache import cache_service
from app.services.freshness import calculate_freshness

# 1. Test Cache Miss
cache_service.clear()
miss = cache_service.get("test_key")
assert miss is None, "Expected cache miss"

# 2. Test Cache Set & Hit
cache_service.set("test_key", {"val": 42}, source="Test Provider", ttl_seconds=2)
hit1 = cache_service.get("test_key")
assert hit1 is not None, "Expected cache hit"
assert hit1["data"]["val"] == 42
retrieved_time = hit1["retrieved_at"]

time.sleep(0.5)
hit2 = cache_service.get("test_key")
assert hit2["retrieved_at"] == retrieved_time, "Cached retrieved_at must remain stable"

# 3. Test Cache Expiration
time.sleep(1.6)
expired = cache_service.get("test_key")
assert expired is None, "Expected expired cache item to be purged"

# 4. Test Freshness Engine
f_live, _, _ = calculate_freshness("2026-09-02T13:40:00Z", expected_cadence="near_real_time")
f_daily, desc_daily, _ = calculate_freshness("2026-08-28T00:00:00Z", expected_cadence="daily")

print("Cache Verification: PASS")
print(f"Freshness Verification (Daily OSTIA SST): {f_daily} - {desc_daily}")
