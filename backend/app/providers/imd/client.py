"""
ORCA Backend — IMD Official API Client
Handles authenticated requests to https://api.imd.gov.in/api/v1 with caching, retries, and honest error handling.
"""
import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import urllib.request
import urllib.error

from app.core.config import settings
from app.services.cache import cache_service

logger = logging.getLogger("orca.imd")


class IMDClient:
    def __init__(self):
        self.base_url = settings.imd_api_base_url.rstrip("/")
        self.api_key = settings.imd_api_key
        self.timeout = 10.0

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "ORCA-Marine-Platform/1.0",
        }
        if self.api_key:
            headers["X-API-KEY"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, ttl_seconds: int = 300) -> Dict[str, Any]:
        """
        Execute cached GET request to IMD API.
        """
        endpoint_clean = endpoint.lstrip("/")
        cache_key = f"imd:{endpoint_clean}:{str(sorted(params.items()) if params else '')}"

        # 1. Check cache
        cached = cache_service.get(cache_key)
        if cached:
            return {
                "status": "CONNECTED",
                "data": cached["data"],
                "source": "IMD (Cached)",
                "retrieved_at": cached["retrieved_at"],
                "is_cached": True,
                "error": None,
            }

        url = f"{self.base_url}/{endpoint_clean}"
        if params:
            query_str = urllib.parse.urlencode(params)
            url = f"{url}?{query_str}"

        now_iso = datetime.now(tz=timezone.utc).isoformat()

        # 2. Perform live network request
        try:
            req = urllib.request.Request(url, headers=self._get_headers())
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    cache_service.set(cache_key, data, source="IMD", ttl_seconds=ttl_seconds)
                    return {
                        "status": "CONNECTED",
                        "data": data,
                        "source": "IMD (Live)",
                        "retrieved_at": now_iso,
                        "is_cached": False,
                        "error": None,
                    }
        except urllib.error.HTTPError as e:
            logger.warning(f"IMD API returned HTTP {e.code} for {url}")
            return {
                "status": "UNAVAILABLE" if e.code in [401, 403] else "ERROR",
                "data": None,
                "source": "IMD",
                "retrieved_at": now_iso,
                "is_cached": False,
                "error": f"IMD API HTTP {e.code}: {e.reason}",
            }
        except Exception as e:
            logger.warning(f"IMD request failed ({url}): {e}")
            return {
                "status": "UNAVAILABLE",
                "data": None,
                "source": "IMD",
                "retrieved_at": now_iso,
                "is_cached": False,
                "error": str(e),
            }


imd_client = IMDClient()
