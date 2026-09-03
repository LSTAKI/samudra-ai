import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.providers.copernicus.feature_info import execute_feature_info

test_coords = [
    ("Kozhikode Coastal Click", 10.9472, 75.7372),
    ("Kochi Coastal Click", 9.9312, 76.2673),
    ("Bangalore Inland Click", 12.9716, 77.5946),
    ("Deep Offshore Arabian Sea", 10.0000, 70.0000),
]

async def run_tests():
    print("==================================================")
    print("TESTING FEATURE INFO NEAREST-OCEAN-CELL SAMPLING")
    print("==================================================")

    for label, lat, lon in test_coords:
        print(f"\n--- {label}: ({lat}° N, {lon}° E) ---")
        res = await execute_feature_info("copernicus-sst", lat, lon)
        print(f"Status: {res.get('status')}")
        print(f"Sampling Method: {res.get('sampling_method')}")
        print(f"Requested: {res.get('latitude')}° N, {res.get('longitude')}° E")
        print(f"Sampled: {res.get('sampled_latitude')}° N, {res.get('sampled_longitude')}° E")
        print(f"Value: {res.get('value')} {res.get('unit')}")
        print(f"Error/Notes: {res.get('error')}")

    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
