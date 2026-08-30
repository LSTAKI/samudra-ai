"""
ORCA Backend — Security
Optional Bearer API key validation.
Passthrough if API_KEY env var is not configured.
"""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

_bearer = HTTPBearer(auto_error=False)


async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> None:
    """Dependency: validates Bearer token if API_KEY is configured."""
    if not settings.has_api_key:
        return  # Open access mode
    if credentials is None or credentials.credentials != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )
