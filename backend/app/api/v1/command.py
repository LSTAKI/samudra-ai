"""
ORCA Backend — Command Center API Router
GET   /api/v1/command/events                 — Active operational events
GET   /api/v1/command/events/{id}            — Full event details
PATCH /api/v1/command/events/{id}/status     — Update workflow status
GET   /api/v1/command/vessels                — Vessel positions and tracks
GET   /api/v1/command/system-status          — Service health matrix
"""
from fastapi import APIRouter, Depends, HTTPException, Query

from app.agents import safety_agent
from app.core.security import verify_api_key
from app.schemas.command import EventStatusUpdateRequest
from app.schemas.envelope import DataStatus, make_envelope

router = APIRouter(prefix="/command", tags=["Command"])

# In-memory workflow state store (use DB in production)
_event_states: dict[str, str] = {}


@router.get("/events")
async def get_events(
    severity: str = Query(default="ALL"),
    category: str = Query(default="ALL"),
    time_window: str = Query(default="24H"),
    _: None = Depends(verify_api_key),
):
    """
    Returns active operational events.
    Connects to: CommandEventList (/research/command page).
    """
    events = safety_agent.get_events(severity, category, time_window)
    # Apply in-memory workflow status overrides
    data = []
    for e in events:
        d = e.model_dump()
        d["workflow_status"] = _event_states.get(e.id, d["workflow_status"])
        data.append(d)
    return make_envelope(
        data=data,
        data_status=DataStatus.DEMO,
        warnings=["Event feed is DEMO — does not trigger external alerts."],
    )


@router.get("/events/{event_id}")
async def get_event(event_id: str, _: None = Depends(verify_api_key)):
    """Returns full event briefing."""
    event = safety_agent.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    d = event.model_dump()
    d["workflow_status"] = _event_states.get(event_id, d["workflow_status"])
    return make_envelope(data=d, data_status=DataStatus.DEMO)


@router.patch("/events/{event_id}/status")
async def update_event_status(
    event_id: str,
    request: EventStatusUpdateRequest,
    _: None = Depends(verify_api_key),
):
    """
    Updates event workflow status.
    Connects to: CommandActions in Zustand store (/research/command page).
    """
    valid_statuses = {"ACKNOWLEDGED", "INVESTIGATING", "RESOLVED"}
    if request.status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"status must be one of {valid_statuses}")
    import uuid
    _event_states[event_id] = request.status
    return make_envelope(
        data={
            "success": True,
            "event_id": event_id,
            "new_status": request.status,
            "audit_id": str(uuid.uuid4()),
        },
        data_status=DataStatus.DEMO,
    )


@router.get("/vessels")
async def get_vessels(_: None = Depends(verify_api_key)):
    """
    Returns vessel positions and tracks.
    Connects to: CommandMap vessels layer (/research/command page).
    """
    vessels = safety_agent.get_vessels()
    return make_envelope(
        data=[v.model_dump() for v in vessels],
        data_status=DataStatus.DEMO,
        warnings=["AIS vessel data is DEMO. Real AIS requires licensed receiver network."],
    )


@router.get("/system-status")
async def get_system_status(_: None = Depends(verify_api_key)):
    """
    Returns service health and ingestion gateway status.
    Connects to: CommandSystemStatus (/research/command page).
    """
    statuses = safety_agent.get_system_status()
    return make_envelope(data=[s.model_dump() for s in statuses], data_status=DataStatus.DEMO)
