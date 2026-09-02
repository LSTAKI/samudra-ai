"""
ORCA Backend — Zero-Dependency Test Runner
Runs tests using standard library unittest and asyncio.
"""
import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.providers.copernicus.wmts import get_available_layers, query_feature_info
from app.services.pfz_engine import compute_deterministic_pfz, haversine_distance, calculate_bearing
from app.providers.imd.weather import get_current_weather
from app.providers.imd.marine import get_port_warnings
from app.providers.imd.cyclone import get_active_cyclones
from app.providers.imd.astronomy import get_sun_moon_ephemeris
from app.api.v1.agents import agent_platform_status
from app.api.v1.system import health, sources


async def run_all_tests():
    passed = 0
    failed = 0

    print("==================================================")
    print("ORCA BACKEND TEST SUITE")
    print("==================================================")

    # 1. Copernicus Layers
    try:
        layers = get_available_layers()
        assert len(layers) >= 4
        print("[PASS] Copernicus Layers Registry")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Copernicus Layers Registry: {e}")
        failed += 1

    # 2. Copernicus Feature Info
    try:
        info = await query_feature_info("copernicus-sst", 9.9312, 76.2673)
        assert info["status"] == "CONNECTED"
        assert info["unit"] == "°C"
        print("[PASS] Copernicus GetFeatureInfo Point Slicer")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Copernicus GetFeatureInfo Point Slicer: {e}")
        failed += 1

    # 3. Deterministic PFZ Engine
    try:
        dist = haversine_distance(9.9312, 76.2673, 9.4981, 76.3388)
        assert 40.0 < dist < 60.0
        bearing = calculate_bearing(0.0, 0.0, 10.0, 0.0)
        assert bearing == 0
        pfz = compute_deterministic_pfz(9.9312, 76.2673, "Kochi")
        assert pfz["status"] == "CONNECTED"
        assert len(pfz["zones"]) > 0
        print("[PASS] Deterministic PFZ Engine (v1.0-deterministic)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Deterministic PFZ Engine: {e}")
        failed += 1

    # 4. IMD Weather & Marine
    try:
        wx = await get_current_weather(lat=9.9312, lon=76.2673)
        assert wx["status"] in ["CONNECTED", "UNAVAILABLE"]
        pw = await get_port_warnings()
        assert pw is not None
        cyc = await get_active_cyclones()
        assert cyc is not None
        astro = await get_sun_moon_ephemeris(9.9312, 76.2673)
        assert astro is not None
        print("[PASS] IMD Weather, Marine Bulletins, Cyclones & Astronomy")
        passed += 1
    except Exception as e:
        print(f"[FAIL] IMD Provider Modules: {e}")
        failed += 1

    # 5. System Health & Decoupled Multi-Agent Gateway
    try:
        h = await health()
        assert h["status"] == "CONNECTED"
        s = await sources()
        assert len(s["sources"]) >= 3
        agent_st = await agent_platform_status()
        assert agent_st["status"] in ["NOT_CONNECTED", "CONNECTED", "DEGRADED"]
        print("[PASS] System Diagnostics & Decoupled Agent Gateway")
        passed += 1
    except Exception as e:
        print(f"[FAIL] System Diagnostics & Agent Gateway: {e}")
        failed += 1

    print("==================================================")
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    code = asyncio.run(run_all_tests())
    sys.exit(code)
