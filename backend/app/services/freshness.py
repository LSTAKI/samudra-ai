"""
ORCA Backend — Data Freshness & Quality Engine
Calculates explicit freshness indicators based on source update cadence.
Never labels daily Copernicus data as 'live'.
"""
from datetime import datetime, timezone
from typing import Tuple


def calculate_freshness(observation_time_iso: str, expected_cadence: str = "daily") -> Tuple[str, str, int]:
    """
    Returns (freshness_label, human_readable_description, age_seconds).
    
    Cadence categories:
      - 'near_real_time': e.g. 10m - 1h radar/nowcast
      - 'hourly': 1-3 hour marine forecast
      - 'daily': OSTIA SST, BGC Chlorophyll-a (daily L4)
      - 'static': Bathymetry / Climatology
    """
    try:
        obs_time = datetime.fromisoformat(observation_time_iso.replace("Z", "+00:00"))
        now = datetime.now(tz=timezone.utc)
        age_seconds = int((now - obs_time).total_seconds())

        if expected_cadence == "near_real_time":
            if age_seconds < 1800:  # < 30 mins
                return "LIVE", "Near real-time observation", age_seconds
            elif age_seconds < 7200:  # < 2 hours
                return "RECENT", f"Observed {age_seconds // 60} minutes ago", age_seconds
            else:
                return "STALE", f"Delayed by {age_seconds // 3600} hours", age_seconds

        elif expected_cadence == "hourly":
            if age_seconds < 14400:  # < 4 hours
                return "RECENT", "Recent operational model run", age_seconds
            else:
                return "STALE", f"Model run {age_seconds // 3600}h ago", age_seconds

        elif expected_cadence == "daily":
            if age_seconds < 86400 * 2:  # within 48 hours
                return "DAILY NRT", "Canonical Daily L4 composite", age_seconds
            elif age_seconds < 86400 * 5:
                return "HISTORICAL", f"Observation from {age_seconds // 86400} days ago", age_seconds
            else:
                return "ARCHIVE", f"Archive data ({age_seconds // 86400} days old)", age_seconds

        return "VALID", "Observation within valid window", age_seconds

    except Exception:
        return "UNKNOWN", "Timestamp format indeterminate", 0
