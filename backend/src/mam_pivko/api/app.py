from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from mam_pivko.api import events, health, wishlist
from mam_pivko.config import settings
from mam_pivko.db import close_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    yield
    close_client()


def create_app() -> FastAPI:
    app = FastAPI(title="MAM Pivko API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list(),
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(events.router)
    app.include_router(wishlist.router)

    return app
