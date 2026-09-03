import sys
import os
import math
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.providers.copernicus.feature_info import execute_feature_info, calculate_haversine_distance

test_cases = [
    {
        "name": "Kozhikode Coastal Click",
        "lat": 10.9472,
        "lon": 75.7372,
        "expected_status": "CONNECTED",
        "expected_method": "EXACT_GRID_POINT",
        "expect_value": True,
    },
    {
        "name": "Kochi Coastal Click (Land-masked Fallback)",
        "lat": 9.9312,
        "lon": 76.2673,
        "expected_status": "CONNECTED",
        "expected_method": "NEAREST_OCEAN_CELL",
        "expect_value": True,
    },
    {
        "name": "Bangalore Inland Click (No Ocean Cell)",
        "lat": 12.9716,
        "lon": 77.5946,
        "expected_status": "NO_DATA",
        "expected_method": "EXACT_GRID_POINT",
        "expect_value": False,
    },
    {
        "name": "Deep Offshore Arabian Sea",
        "lat": 10.0000,
        "lon": 70.0000,
        "expected_status": "CONNECTED",
        "expected_method": "EXACT_GRID_POINT",
        "expect_value": True,
    },
]

async def run_tests():
    print("==================================================")
    print("SAMUDRA AI — NEAREST-OCEAN SAMPLING AUDIT & VERIFICATION")
    print("==================================================")

    all_passed = True

    for tc in test_cases:
        print(f"\n--- Test: {tc['name']} ({tc['lat']}° N, {tc['lon']}° E) ---")
        res = await execute_feature_info("copernicus-sst", tc["lat"], tc["lon"])
        
        req_lat = res.get("latitude")
        req_lon = res.get("longitude")
        samp_lat = res.get("sampled_latitude")
        samp_lon = res.get("sampled_longitude")
        method = res.get("sampling_method")
        dist = res.get("sampling_distance_km")
        val = res.get("value")
        status = res.get("status")

        actual_dist = calculate_haversine_distance(req_lat, req_lon, samp_lat, samp_lon)

        print(f"Status: {status} (Expected: {tc['expected_status']})")
        print(f"Sampling Method: {method} (Expected: {tc['expected_method']})")
        print(f"Requested Location: {req_lat}° N, {req_lon}° E")
        print(f"Sampled Grid Cell: {samp_lat}° N, {samp_lon}° E")
        print(f"Reported Distance: {dist} km | Calculated Haversine: {actual_dist:.2f} km")
        print(f"SST Value: {val} {res.get('unit')}")

        # Strict Assertions
        passed = True
        if status != tc["expected_status"]:
            print(f"  [FAIL] Expected status {tc['expected_status']}, got {status}")
            passed = False
        
        if method != tc["expected_method"]:
            print(f"  [FAIL] Expected method {tc['expected_method']}, got {method}")
            passed = False

        if tc["expect_value"] and val is None:
            print("  [FAIL] Expected valid numerical value, got None")
            passed = False
        elif not tc["expect_value"] and val is not None:
            print("  [FAIL] Expected None for inland click, got value")
            passed = False

        if method == "EXACT_GRID_POINT" and (req_lat != samp_lat or req_lon != samp_lon):
            print("  [FAIL] EXACT_GRID_POINT must have identical requested and sampled coordinates!")
            passed = False

        if method == "NEAREST_OCEAN_CELL" and (req_lat == samp_lat and req_lon == samp_lon):
            print("  [FAIL] NEAREST_OCEAN_CELL must have non-zero coordinate displacement!")
            passed = False

        if abs(dist - actual_dist) > 0.1:
            print(f"  [FAIL] Reported distance ({dist}) disagrees with calculated Haversine ({actual_dist:.2f})")
            passed = False

        if passed:
            print("  [PASS] All metadata, sampling method, and distance checks verified!")
        else:
            all_passed = False

    print("\n==================================================")
    if all_passed:
        print("ALL SAMUDRA AI SAMPLING SUITE ASSERTS PASSED SUCCESSFULLY!")
    else:
        print("SOME SAMPLING ASSERTS FAILED — SEE LOGS ABOVE.")
        sys.exit(1)
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
