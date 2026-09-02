"""
ORCA Backend — Unified Caching Service
Dual-tier in-memory cache with optional Redis backend.
Stores cached payloads with source, retrieval timestamp, and TTL.
"""
import time
import logging
from typing import Any, Optional, Dict
from datetime import datetime, timezone

logger = logging.getLogger("orca.cache")


class CacheItem:
    def __init__(self, data: Any, source: str, ttl_seconds: int, metadata: Optional[Dict] = None):
        self.data = data
        self.source = source
        self.retrieved_at = datetime.now(tz=timezone.utc).isoformat()
        self.expires_at = time.time() + ttl_seconds
        self.metadata = metadata or {}

    @property
    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class CacheService:
    def __init__(self):
        self._memory_store: Dict[str, CacheItem] = {}

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve item from cache if present and unexpired."""
        item = self._memory_store.get(key)
        if item is None:
            return None

        if item.is_expired:
            del self._memory_store[key]
            logger.debug(f"Cache expired for key: {key}")
            return None

        return {
            "data": item.data,
            "source": item.source,
            "retrieved_at": item.retrieved_at,
            "metadata": item.metadata,
            "is_cached": True
        }

    def set(self, key: str, data: Any, source: str, ttl_seconds: int = 300, metadata: Optional[Dict] = None):
        """Store item into cache with TTL."""
        self._memory_store[key] = CacheItem(
            data=data,
            source=source,
            ttl_seconds=ttl_seconds,
            metadata=metadata
        )
        logger.debug(f"Cached key: {key} (TTL: {ttl_seconds}s)")

    def clear(self):
        """Flush cache."""
        self._memory_store.clear()

    @property
    def size(self) -> int:
        return len(self._memory_store)


cache_service = CacheService()
