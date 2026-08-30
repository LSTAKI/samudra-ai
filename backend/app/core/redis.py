"""
ORCA Backend — Redis Cache
Falls back to an in-process dict if Redis is unavailable.
"""
import json
import time
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# In-process fallback cache: {key: (expire_at, value)}
_local_cache: dict[str, tuple[float, Any]] = {}

_redis_client = None


def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        import redis
        from app.core.config import settings
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=1)
        _redis_client.ping()
        logger.info("Redis cache connected.")
        return _redis_client
    except Exception:
        logger.warning("Redis unavailable — using in-process cache fallback.")
        return None


def cache_get(key: str) -> Optional[Any]:
    """Get a cached value. Returns None if missing or expired."""
    r = _get_redis()
    if r:
        try:
            raw = r.get(key)
            if raw:
                return json.loads(raw)
            return None
        except Exception:
            pass
    # Fallback
    entry = _local_cache.get(key)
    if entry:
        expire_at, value = entry
        if time.time() < expire_at:
            return value
        del _local_cache[key]
    return None


def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    """Store a value with TTL (seconds)."""
    r = _get_redis()
    if r:
        try:
            r.setex(key, ttl, json.dumps(value, default=str))
            return
        except Exception:
            pass
    # Fallback
    _local_cache[key] = (time.time() + ttl, value)


def cache_delete(key: str) -> None:
    r = _get_redis()
    if r:
        try:
            r.delete(key)
        except Exception:
            pass
    _local_cache.pop(key, None)
