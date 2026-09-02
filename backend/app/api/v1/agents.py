"""
ORCA Backend — External Agent Platform Gateway
Maintains a decoupled bridge to the separate multi-agent reasoning intelligence platform.
Returns honest 'AGENT PLATFORM NOT CONNECTED' when no external agent service is active.
"""
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
import httpx

from app.core.config import settings

router = APIRouter(prefix="/agents", tags=["External Multi-Agent Platform Gateway"])


class AgentQueryRequest(BaseModel):
    query: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    context_parameters: Optional[list] = []


@router.get("/status")
async def agent_platform_status():
    """
    Check connectivity to the external multi-agent reasoning platform.
    """
    if not settings.has_agent_platform:
        return {
            "status": "NOT_CONNECTED",
            "connected": False,
            "message": "The multi-agent reasoning intelligence platform is hosted separately. Configure AGENT_PLATFORM_URL in backend/.env to connect.",
            "endpoint": None
        }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            headers = {"Authorization": f"Bearer {settings.agent_platform_api_key}"} if settings.agent_platform_api_key else {}
            res = await client.get(f"{settings.agent_platform_url}/health", headers=headers)
            if res.status_code == 200:
                return {
                    "status": "CONNECTED",
                    "connected": True,
                    "message": "External multi-agent reasoning platform operational.",
                    "endpoint": settings.agent_platform_url
                }
    except Exception as e:
        return {
            "status": "DEGRADED",
            "connected": False,
            "message": f"Unable to reach external agent platform: {e}",
            "endpoint": settings.agent_platform_url
        }

    return {
        "status": "NOT_CONNECTED",
        "connected": False,
        "message": "External agent platform offline.",
        "endpoint": settings.agent_platform_url
    }


@router.post("/query")
async def query_agent_platform(req: AgentQueryRequest):
    """
    Forward query to external agent reasoning platform if connected.
    """
    if not settings.has_agent_platform:
        return {
            "status": "UNAVAILABLE",
            "connected": False,
            "error": "External multi-agent reasoning system is not connected.",
            "response": None
        }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {"Authorization": f"Bearer {settings.agent_platform_api_key}"} if settings.agent_platform_api_key else {}
            res = await client.post(
                f"{settings.agent_platform_url}/agent/query",
                json=req.model_dump(),
                headers=headers
            )
            if res.status_code == 200:
                return res.json()
    except Exception as e:
        return {
            "status": "ERROR",
            "connected": False,
            "error": f"Agent platform query failed: {e}",
            "response": None
        }

    return {
        "status": "UNAVAILABLE",
        "connected": False,
        "error": "Agent platform returned non-200 response.",
        "response": None
    }
