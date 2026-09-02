"""
Test Suite: Deterministic PFZ Analysis Engine
"""
import pytest
from app.services.pfz_engine import compute_deterministic_pfz, haversine_distance, calculate_bearing


def test_haversine_distance():
    # Kochi to Alappuzha (~55 km)
    dist = haversine_distance(9.9312, 76.2673, 9.4981, 76.3388)
    assert 40.0 < dist < 60.0


def test_calculate_bearing():
    # Due North: 0°
    bearing_n = calculate_bearing(0.0, 0.0, 10.0, 0.0)
    assert bearing_n == 0
    # Due East: 90°
    bearing_e = calculate_bearing(0.0, 0.0, 0.0, 10.0)
    assert bearing_e == 90


def test_compute_deterministic_pfz():
    res = compute_deterministic_pfz(user_lat=9.9312, user_lon=76.2673, harbor="Kochi")
    assert res["status"] == "CONNECTED"
    assert res["method_version"] == "v1.0-deterministic"
    assert res["zones_count"] > 0
    top_zone = res["zones"][0]
    assert "distance_km" in top_zone
    assert "bearing_deg" in top_zone
    assert "eta_minutes" in top_zone
    assert top_zone["score"] >= 60
