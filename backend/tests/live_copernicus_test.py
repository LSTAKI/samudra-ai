"""
ORCA Backend — Copernicus Marine Live Integration Test
Executes live network requests against the Copernicus Marine WMTS service.
Verifies raster tile rendering, GetFeatureInfo point queries, and dataset catalogue integrity.
"""
import sys
import os
import time
import urllib.request
import urllib.error
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.providers.copernicus.registry import COPERNICUS_DATASET_REGISTRY
from app.services.pfz_engine import compute_deterministic_pfz


def run_live_tests():
    print("==================================================")
    print("COPERNICUS MARINE LIVE INTEGRATION TEST SUITE")
    print("==================================================")

    passed = 0
    failed = 0

    # 1. GetCapabilities
    cap_url = "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
    t0 = time.time()
    try:
        req = urllib.request.Request(cap_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=12.0) as resp:
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            print(f"[PASS] WMTS GetCapabilities: HTTP 200 ({elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] WMTS GetCapabilities: {e}")
        failed += 1

    # 2. OSTIA SST Tile
    sst_url = (
        "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
        "LAYER=SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst&"
        "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png"
    )
    t0 = time.time()
    try:
        req = urllib.request.Request(sst_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            data = resp.read()
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            assert len(data) > 10000
            print(f"[PASS] OSTIA SST Raster Tile: HTTP 200 ({len(data)} bytes, {elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] OSTIA SST Raster Tile: {e}")
        failed += 1

    # 3. Wave Height Tile
    wave_url = (
        "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
        "LAYER=GLOBAL_ANALYSISFORECAST_WAV_001_027/cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411/VHM0&"
        "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png"
    )
    t0 = time.time()
    try:
        req = urllib.request.Request(wave_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            data = resp.read()
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            assert len(data) > 10000
            print(f"[PASS] Significant Wave Height Raster Tile: HTTP 200 ({len(data)} bytes, {elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Significant Wave Height Raster Tile: {e}")
        failed += 1

    # 4. Chlorophyll-a Tile
    chl_url = (
        "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
        "LAYER=OCEANCOLOUR_GLO_BGC_L3_MY_009_107/c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303/CHL&"
        "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png"
    )
    t0 = time.time()
    try:
        req = urllib.request.Request(chl_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            data = resp.read()
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            assert len(data) > 10000
            print(f"[PASS] Chlorophyll-a Raster Tile: HTTP 200 ({len(data)} bytes, {elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Chlorophyll-a Raster Tile: {e}")
        failed += 1

    # 5. Sea Level Anomaly Tile
    sla_url = (
        "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
        "LAYER=SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057/c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411/sla&"
        "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&FORMAT=image/png"
    )
    t0 = time.time()
    try:
        req = urllib.request.Request(sla_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            data = resp.read()
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            assert len(data) > 10000
            print(f"[PASS] Sea Level Anomaly Raster Tile: HTTP 200 ({len(data)} bytes, {elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Sea Level Anomaly Raster Tile: {e}")
        failed += 1

    # 6. GetFeatureInfo Point Slicer
    fi_url = (
        "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&"
        "LAYER=SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst&"
        "STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=4&TILEROW=7&TILECOL=11&"
        "I=128&J=128&INFOFORMAT=application/json"
    )
    t0 = time.time()
    try:
        req = urllib.request.Request(fi_url, headers={"User-Agent": "ORCA-Live-Test/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            raw = resp.read().decode("utf-8")
            elapsed = round((time.time() - t0) * 1000, 1)
            assert resp.status == 200
            parsed = json.loads(raw)
            assert "features" in parsed
            print(f"[PASS] GetFeatureInfo Point Query: HTTP 200 ({len(parsed['features'])} features, {elapsed}ms)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] GetFeatureInfo Point Query: {e}")
        failed += 1

    # 7. PFZ Deterministic Integration
    try:
        pfz = compute_deterministic_pfz(9.9312, 76.2673, "Kochi")
        assert pfz["status"] == "CONNECTED"
        assert len(pfz["zones"]) > 0
        print(f"[PASS] PFZ Deterministic Engine Integration ({len(pfz['zones'])} candidate zones)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] PFZ Engine Integration: {e}")
        failed += 1

    print("==================================================")
    print(f"LIVE TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    code = run_live_tests()
    sys.exit(code)
