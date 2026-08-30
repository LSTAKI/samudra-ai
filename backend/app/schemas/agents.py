"""
ORCA Backend — Agent Schemas
Aligned with AIMessage TypeScript interface (types/index.ts) and mockAI.ts shapes.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class Coordinates(BaseModel):
    lat: float
    lng: float


class AgentQueryRequest(BaseModel):
    query: str
    coordinates: Optional[Coordinates] = None
    region: Optional[str] = None
    context: Optional[str] = None


class DataEvidenceItem(BaseModel):
    sensor: str
    value: str


class ConsensusItem(BaseModel):
    sensor: str
    value: str


class ConsensusResult(BaseModel):
    values: List[ConsensusItem]
    consensus_value: str
    difference: str
    confidence: str  # HIGH | MEDIUM | LOW


class ProvenanceItem(BaseModel):
    source: str
    dataset: str
    coordinates: str
    timestamp: str
    processing: str
    validation: str
    confidence: str


class AgentStep(BaseModel):
    agent: str
    action: str
    result: str
    data_status: str = "DEMO"


class AIMessageResponse(BaseModel):
    """Matches the AIMessage TypeScript interface in types/index.ts."""
    id: str
    question: str
    analysis: str
    data_evidence: List[DataEvidenceItem]
    consensus: Optional[ConsensusResult] = None
    confidence: str  # HIGH | MEDIUM | LOW
    provenance: List[ProvenanceItem]
    agent_steps: List[AgentStep] = []


class AgentTaskStatus(BaseModel):
    task_id: str
    status: str  # QUEUED | RUNNING | COMPLETED | FAILED
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
