"""
PFZ Reproducibility Audit Probe
Verifies that same inputs produce identical mathematical outputs with zero randomness.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.pfz_engine import compute_deterministic_pfz

res1 = compute_deterministic_pfz(9.9312, 76.2673, "Kochi")
res2 = compute_deterministic_pfz(9.9312, 76.2673, "Kochi")

zones1 = res1["zones"]
zones2 = res2["zones"]

assert len(zones1) == len(zones2), "Zones count mismatch"

reproducible = True
for z1, z2 in zip(zones1, zones2):
    if z1["id"] != z2["id"] or z1["score"] != z2["score"] or z1["distance_km"] != z2["distance_km"] or z1["bearing_deg"] != z2["bearing_deg"]:
        reproducible = False
        break

print(f"PFZ Determinism & Reproducibility: {'PASS (100% Deterministic)' if reproducible else 'FAIL'}")
print(f"Sample Candidate Zone 1: {zones1[0]['name']} | Score: {zones1[0]['score']} | Distance: {zones1[0]['distance_km']} km | Bearing: {zones1[0]['bearing_deg']} deg | Method: {zones1[0]['method_version']}")
