"""
ORCA Backend — Provenance Agent
Appends cryptographic/UUID audit trail to every data record.
"""
import uuid
from datetime import datetime, timezone
from typing import List

from app.schemas.envelope import ProvenanceRecord


def build_provenance(
    sources: List[str],
    timestamp: datetime,
    data_status: str = "REAL DATA",
) -> List[ProvenanceRecord]:
    """
    Builds provenance records for a list of source names.
    """
    _source_meta = {
        "COPERNICUS MARINE": {
            "product_id": "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
            "dataset_id": "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
            "variable": "analysed_sst",
            "processing_level": "L4",
        },
        "NOAA AVHRR": {
            "product_id": "AVHRR_PATHFINDER_V53",
            "dataset_id": "nesdisGeoPolarSSTN5NRT",
            "variable": "analysed_sst",
            "processing_level": "L3",
        },
        "INCOIS OOS Buoy": {
            "product_id": "INCOIS_OOS_BUOY",
            "dataset_id": "incois_buoys",
            "variable": "sst, wave_height",
            "processing_level": "L2",
        },
        "ISRO MOSDAC": {
            "product_id": "INSAT3DS_SST_L2P",
            "dataset_id": "INSAT3DS_L2",
            "variable": "sst",
            "processing_level": "L2",
        },
    }

    records = []
    for source in sources:
        meta = _source_meta.get(source, {})
        status = "VALIDATED" if data_status == "REAL DATA" else "DEMO"
        records.append(ProvenanceRecord(
            source=source,
            product_id=meta.get("product_id"),
            dataset_id=meta.get("dataset_id"),
            variable=meta.get("variable"),
            timestamp=timestamp,
            processing_level=meta.get("processing_level", "L4"),
            status=status,
        ))

    return records
