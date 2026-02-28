"""
Backend API for Health Recommender
Uses FastAPI to serve endpoints for Health Recommender Application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.bmi import router as bmi_router
from routers.workout import router as workout_router
from routers.diet import router as diet_router
from routers.bmr import router as bmr_router
from routers.bodyfat import router as bodyfat_router
from routers.macros import router as macros_router

app = FastAPI(
    title="Health Recommender API",
    description="APIs for Health Recommender Application",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # only your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(bmi_router)

app.include_router(workout_router, prefix="/workout")

app.include_router(diet_router, prefix="/diet")

app.include_router(bmr_router)

app.include_router(bodyfat_router)

app.include_router(macros_router)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
