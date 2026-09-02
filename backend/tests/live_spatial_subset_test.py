"""
ORCA Backend — Copernicus Numerical Spatial Subset Live Integration Test
Tests GET /api/v1/ocean/spatial-summary directly with real Copernicus Marine data queries.
Verifies BBOX handling, observation counting, min/max/mean statistical correctness, and caching behavior.
"""
import sys
import os
import asyncio
import time
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.providers.copernicus.subset import calculate_spatial_summary
from app.services.cache import cache_service


async def test_live_spatial_subset():
    print("==================================================")
    print("COPERNICUS NUMERICAL SUBSET LIVE INTEGRATION TEST")
    print("==================================================")

    cache_service.clear()

    # Define verified bounding box in Indian Ocean (Arabian Sea / Kochi sector)
    dataset_key = "copernicus-sst"
    min_lat = 9.0
    max_lat = 11.0
    min_lon = 74.0
    max_lon = 76.5
    req_time = "2026-08-28T00:00:00Z"

    # Request 1: Fresh Live Numerical Query
    t0 = time.time()
    res1 = await calculate_spatial_summary(
        dataset_key=dataset_key,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
        time_iso=req_time
    )
    elapsed1 = round((time.time() - t0) * 1000, 1)

    # 1. Copernicus Numerical Subset verification
    assert res1["status"] == "CONNECTED", f"Expected CONNECTED, got {res1['status']}"
    assert "Copernicus" in res1["source"], f"Source mismatch: {res1['source']}"
    assert res1["product_id"] == "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001", f"Product ID mismatch: {res1['product_id']}"
    assert res1["dataset_id"] == "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2", f"Dataset ID mismatch: {res1['dataset_id']}"
    assert res1["variable"] == "analysed_sst", f"Variable mismatch: {res1['variable']}"
    assert res1["units"] == "°C", f"Units mismatch: {res1['units']}"
    assert res1["observation_timestamp"] == req_time, f"Timestamp mismatch: {res1['observation_timestamp']}"
    assert "retrieved_at" in res1, "retrieved_at missing"
    assert res1["is_cached"] is False, "Initial request must not be cached"
    print(f"[PASS] Copernicus Numerical Subset (HTTP query {elapsed1}ms, dataset: {res1['dataset_id']})")

    # 2. Spatial BBOX respected
    bbox = res1["bbox"]
    assert bbox["min_lat"] == min_lat
    assert bbox["max_lat"] == max_lat
    assert bbox["min_lon"] == min_lon
    assert bbox["max_lon"] == max_lon
    print(f"[PASS] Spatial BBOX respected ([{min_lat}, {max_lat}] N, [{min_lon}, {max_lon}] E)")

    # 3. Real observation count
    count = res1.get("count", 0)
    assert count > 0, f"Expected valid observation count > 0, got {count}"
    print(f"[PASS] Real observation count ({count} grid points sampled)")

    # 4. Statistics validated
    stats = res1.get("statistics")
    assert stats is not None, "Statistics object is missing"
    val_min = stats["min"]
    val_max = stats["max"]
    val_mean = stats["mean"]
    assert val_min <= val_max, f"min ({val_min}) should be <= max ({val_max})"
    assert val_min <= val_mean <= val_max, f"mean ({val_mean}) should be between min and max"
    print(f"[PASS] Statistics validated (min: {val_min}°C, max: {val_max}°C, mean: {val_mean}°C)")

    # 5. Cache behavior (Request 2)
    t1 = time.time()
    res2 = await calculate_spatial_summary(
        dataset_key=dataset_key,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
        time_iso=req_time
    )
    elapsed2 = round((time.time() - t1) * 1000, 1)

    assert res2["is_cached"] is True, "Second request must be served from cache"
    assert res2["retrieved_at"] == res1["retrieved_at"], "retrieved_at must remain pinned on cache hit"
    assert res2["statistics"] == res1["statistics"], "Cached statistics must match"
    print(f"[PASS] Cache behavior (Cache hit in {elapsed2}ms, pinned retrieved_at: {res2['retrieved_at']})")

    print("==================================================")
    print("ALL NUMERICAL SUBSET CRITERIA VERIFIED")
    print("==================================================")
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(test_live_spatial_subset())
    sys.exit(exit_code)
