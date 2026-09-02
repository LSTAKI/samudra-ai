"""
Test Suite: Copernicus Marine WMTS & Feature Info Point Slicer
"""
import pytest
from app.providers.copernicus.wmts import get_available_layers, query_feature_info


def test_get_available_layers():
    layers = get_available_layers()
    assert len(layers) >= 4
    layer_ids = [l["id"] for l in layers]
    assert "copernicus-sst" in layer_ids
    assert "copernicus-wave" in layer_ids
    assert "copernicus-sla" in layer_ids
    assert "copernicus-chl" in layer_ids


@pytest.mark.asyncio
async def test_query_feature_info():
    info = await query_feature_info(layer_id="copernicus-sst", lat=9.9312, lon=76.2673)
    assert info is not None
    assert info["status"] == "CONNECTED"
    assert info["unit"] == "°C"
    assert info["latitude"] == 9.9312
    assert info["longitude"] == 76.2673
    assert info["value"] > 20.0 and info["value"] < 35.0
