"""
ORCA Backend — V1 API Router
Aggregates all domain sub-routers under /api/v1
"""
from fastapi import APIRouter
from app.api.v1 import (
    ocean,
    weather,
    marine,
    cyclones,
    satellites,
    pfz,
    system,
    agents
)

router = APIRouter(prefix="/v1")

router.include_router(ocean.router)
router.include_router(weather.router)
router.include_router(marine.router)
router.include_router(cyclones.router)
router.include_router(satellites.router)
router.include_router(pfz.router)
router.include_router(system.router)
router.include_router(agents.router)
