"""
Test Suite: System Diagnostics & Decoupled Multi-Agent Gateway
"""
import pytest
from app.api.v1.agents import agent_platform_status
from app.api.v1.system import health, sources


@pytest.mark.asyncio
async def test_agent_platform_decoupled_status():
    status = await agent_platform_status()
    assert status is not None
    assert status["status"] in ["NOT_CONNECTED", "CONNECTED", "DEGRADED"]
    assert "message" in status


@pytest.mark.asyncio
async def test_system_health():
    h = await health()
    assert h["status"] == "CONNECTED"
    assert "services" in h
    assert "copernicus_wmts" in h["services"]
    assert "imd_gateway" in h["services"]


@pytest.mark.asyncio
async def test_system_sources():
    s = await sources()
    assert len(s["sources"]) >= 3
    source_ids = [src["id"] for src in s["sources"]]
    assert "copernicus" in source_ids
    assert "imd" in source_ids
    assert "agent_platform" in source_ids
