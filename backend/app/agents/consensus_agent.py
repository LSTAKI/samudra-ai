"""
ORCA Backend — Consensus Agent
Compares readings across providers and computes inter-sensor bias.

STRICT RULE: If only one provider is available, consensus_status = "INSUFFICIENT_SOURCES".
Never fabricates agreement across sources that did not provide data.
"""
from typing import Dict, List, Optional


def evaluate_consensus(
    readings: Dict[str, Optional[float]],
    param: str,
) -> dict:
    """
    Evaluates consensus across multiple sensor readings.
    readings: {source_name: value_or_None}
    Returns consensus dict matching AIMessage ConsensusResult shape.
    """
    valid_readings = {k: v for k, v in readings.items() if v is not None}

    if len(valid_readings) == 0:
        return {
            "values": [],
            "consensus_value": "N/A",
            "difference": "N/A",
            "confidence": "LOW",
            "consensus_status": "INSUFFICIENT_SOURCES",
        }

    if len(valid_readings) == 1:
        src, val = list(valid_readings.items())[0]
        unit = _unit_for(param)
        return {
            "values": [{"sensor": src, "value": f"{val}{unit}"}],
            "consensus_value": f"{val}{unit}",
            "difference": "N/A",
            "confidence": "LOW",
            "consensus_status": "INSUFFICIENT_SOURCES",
        }

    import numpy as np
    vals = list(valid_readings.values())
    mean_val = round(float(np.mean(vals)), 3)
    spread = round(float(max(vals) - min(vals)), 4)
    unit = _unit_for(param)

    confidence = "HIGH" if spread < 0.1 else ("MEDIUM" if spread < 0.3 else "LOW")
    consensus_status = "HIGH" if spread < 0.1 else ("MODERATE" if spread < 0.3 else "LOW")

    return {
        "values": [{"sensor": k, "value": f"{v}{unit}"} for k, v in valid_readings.items()],
        "consensus_value": f"{mean_val}{unit}",
        "difference": f"{spread}{unit}",
        "confidence": confidence,
        "consensus_status": consensus_status,
    }


def _unit_for(param: str) -> str:
    units = {
        "sst": "°C", "chlorophyll": " mg/m³", "wave_height": "m",
        "salinity": " PSU", "wind_speed": " m/s", "sla": "m",
    }
    return units.get(param, "")
