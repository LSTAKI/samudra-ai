"""
ORCA Backend — Agents API Router
POST /api/v1/agents/query        — Multi-agent AI reasoning
GET  /api/v1/agents/tasks/{id}   — Task status polling
"""
import uuid
from fastapi import APIRouter, Depends
from app.agents.orchestrator import orchestrate
from app.core.security import verify_api_key
from app.schemas.agents import AgentQueryRequest
from app.schemas.envelope import DataStatus, make_envelope

router = APIRouter(prefix="/agents", tags=["Agents"])

# Simple in-memory task store
_tasks: dict = {}


@router.post("/query")
async def agent_query(
    request: AgentQueryRequest,
    _: None = Depends(verify_api_key),
):
    """
    Runs the full multi-agent orchestration pipeline.
    Connects to: AIReasoningConsole component (/research page).
    
    Guardrails:
    - LLM never generates numerical measurements
    - All numbers come from deterministic agent computations
    - Synthesis strictly grounded in evidence block
    """
    result = await orchestrate(request)
    data_status = DataStatus.DEMO  # agent results are DEMO until all sources are live
    return make_envelope(
        data=result.model_dump(),
        data_status=data_status,
    )


@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str, _: None = Depends(verify_api_key)):
    """Returns async task status."""
    task = _tasks.get(task_id)
    if not task:
        return make_envelope(
            data={"task_id": task_id, "status": "NOT_FOUND"},
            data_status=DataStatus.DEMO,
        )
    return make_envelope(data=task, data_status=DataStatus.DEMO)
