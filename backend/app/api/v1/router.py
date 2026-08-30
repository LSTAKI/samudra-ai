"""
ORCA Backend — V1 API Router
Aggregates all sub-routers under /api/v1
"""
from fastapi import APIRouter
from app.api.v1 import ocean, satellites, pfz, analytics, command, agents

router = APIRouter(prefix="/v1")

router.include_router(ocean.router)
router.include_router(satellites.router)
router.include_router(pfz.router)
router.include_router(analytics.router)
router.include_router(command.router)
router.include_router(agents.router)
