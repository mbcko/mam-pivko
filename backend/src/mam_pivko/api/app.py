from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from mam_pivko.api import events, health
from mam_pivko.config import settings
from mam_pivko.db import close_client, get_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    get_client()  # ensure client is created on startup
    yield
    await close_client()


def create_app() -> FastAPI:
    app = FastAPI(title="MAM Pivko API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(events.router)

    return app
