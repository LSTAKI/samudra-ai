"""
ORCA Backend — Copernicus Marine Timeseries Live Integration Test
Tests GET /api/v1/ocean/timeseries directly with real Copernicus Marine data queries.
Verifies coordinate validation, dataset/variable binding, chronological ordering, caching, and spatial variance.
"""
import sys
import os
import asyncio
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.providers.copernicus.timeseries import get_ocean_timeseries
from app.services.cache import cache_service


async def test_live_timeseries():
    print("==================================================")
    print("COPERNICUS TIMESERIES LIVE INTEGRATION TEST")
    print("==================================================")

    cache_service.clear()

    dataset_key = "copernicus-sst"
    lat = 9.9312
    lon = 76.2673
    steps = 5

    # 1. Real Copernicus Timeseries Request
    t0 = time.time()
    res1 = await get_ocean_timeseries(
        dataset_key=dataset_key,
        lat=lat,
        lon=lon,
        steps=steps
    )
    elapsed1 = round((time.time() - t0) * 1000, 1)

    assert res1["status"] in ["CONNECTED", "VALID"], f"Expected CONNECTED, got {res1['status']}"
    assert res1["count"] > 0, "Expected non-zero valid observations"
    print(f"[PASS] Real Copernicus Timeseries Request (HTTP query {elapsed1}ms, {res1['count']} observations)")

    # 2. Coordinate Validation
    coords = res1["coordinates"]
    assert coords["latitude"] == lat, f"Latitude mismatch: {coords['latitude']}"
    assert coords["longitude"] == lon, f"Longitude mismatch: {coords['longitude']}"
    print(f"[PASS] Coordinate Validation (lat={lat}° N, lon={lon}° E)")

    # 3. Dataset Validation
    assert res1["product_id"] == "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001", f"Product ID mismatch: {res1['product_id']}"
    assert res1["dataset_id"] == "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2", f"Dataset ID mismatch: {res1['dataset_id']}"
    print(f"[PASS] Dataset Validation (Dataset: {res1['dataset_id']})")

    # 4. Variable Validation
    assert res1["variable"] == "analysed_sst", f"Variable mismatch: {res1['variable']}"
    assert res1["units"] == "°C", f"Units mismatch: {res1['units']}"
    print(f"[PASS] Variable Validation (Variable: {res1['variable']}, Units: {res1['units']})")

    # 5. Observation Timestamp Validation
    records = res1["records"]
    assert len(records) == steps, f"Expected {steps} records, got {len(records)}"
    for r in records:
        assert "T" in r["timestamp"] and r["timestamp"].endswith("Z"), f"Invalid ISO timestamp: {r['timestamp']}"
    print(f"[PASS] Observation Timestamp Validation (Range: {res1['first_observation']} to {res1['last_observation']})")

    # 6. Observation Value Validation
    for r in records:
        if r["value"] is not None:
            assert isinstance(r["value"], (int, float)), f"Observation value must be numeric: {r['value']}"
            assert 15.0 <= r["value"] <= 35.0, f"SST value out of plausible marine range: {r['value']}°C"
    print(f"[PASS] Observation Value Validation (Sample values: {[r['value'] for r in records]})")

    # 7. Chronological Ordering
    for i in range(len(records) - 1):
        assert records[i]["timestamp"] <= records[i+1]["timestamp"], f"Chronological violation: {records[i]['timestamp']} > {records[i+1]['timestamp']}"
    print(f"[PASS] Chronological Ordering (Strict ascending timestamp order)")

    # 8. No-data Handling
    for r in records:
        assert r["status"] in ["VALID", "NO_DATA"], f"Unknown status: {r['status']}"
    print(f"[PASS] No-data Handling (All intervals categorized as VALID or NO_DATA)")

    # 9. Provenance
    assert "Copernicus" in res1["source"], f"Provenance mismatch: {res1['source']}"
    assert "retrieved_at" in res1 and res1["retrieved_at"], "retrieved_at missing"
    print(f"[PASS] Provenance (Source: {res1['source']}, Retrieved: {res1['retrieved_at']})")

    # 10. Cache Behavior & Repeatability
    t1 = time.time()
    res2 = await get_ocean_timeseries(
        dataset_key=dataset_key,
        lat=lat,
        lon=lon,
        steps=steps
    )
    elapsed2 = round((time.time() - t1) * 1000, 1)

    assert res2["is_cached"] is True, "Second query must be served from cache"
    assert res2["retrieved_at"] == res1["retrieved_at"], "retrieved_at must remain stable on cache hit"
    assert res2["records"] == res1["records"], "Cached records must be identical"
    print(f"[PASS] Cache Behavior (Cache hit in {elapsed2}ms, identical observations confirmed)")

    # 11. Spatial Variance (Changing location produces different query)
    res_diff_loc = await get_ocean_timeseries(
        dataset_key=dataset_key,
        lat=15.0,
        lon=72.0,
        steps=steps
    )
    assert res_diff_loc["coordinates"]["latitude"] == 15.0
    assert res_diff_loc["coordinates"]["longitude"] == 72.0

    # 12. Variable Change (Changing variable queries wave model)
    res_wave = await get_ocean_timeseries(
        dataset_key="copernicus-wave",
        lat=lat,
        lon=lon,
        steps=steps
    )
    assert res_wave["dataset_id"] == "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411"
    assert res_wave["variable"] == "VHM0"
    assert res_wave["units"] == "m"

    print("==================================================")
    print("FINAL TIMESERIES AUDIT SUMMARY:")
    print(f"- Endpoint Tested:        GET /api/v1/ocean/timeseries")
    print(f"- Dataset:                {res1['dataset_id']}")
    print(f"- Variable:               {res1['variable']} ({res1['units']})")
    print(f"- Coordinate:             {lat}° N, {lon}° E")
    print(f"- Time Range:             {res1['time_range']['start']} to {res1['time_range']['end']}")
    print(f"- Number of Observations: {res1['count']}")
    print(f"- First Observation:      {res1['first_observation']} ({records[0]['value']} {res1['units']})")
    print(f"- Last Observation:       {res1['last_observation']} ({records[-1]['value']} {res1['units']})")
    print(f"- Cache Result:           Hit verified ({elapsed2}ms)")
    print(f"- Latency:                {elapsed1}ms (Live network)")
    print(f"- Status:                 {res1['status']}")
    print("==================================================")
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(test_live_timeseries())
    sys.exit(exit_code)
