"""MoveLingo API entrypoint.

FROZEN after step B0 (CONTRACT.md section 3): nobody edits this file again.
Everything extensible lives in routers/, models/, engines/ and ai/.
"""
from __future__ import annotations

import importlib
import logging
import pkgutil
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

API_DIR = Path(__file__).resolve().parent

try:  # services/api/.env, per CONTRACT.md section 2
    from dotenv import load_dotenv

    load_dotenv(API_DIR / ".env")
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("movelingo")

STATUS_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    422: "validation_error",
}


def error_response(status: int, code: str, message: str) -> JSONResponse:
    """The one error shape allowed by CONTRACT.md section 2."""
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message}})


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup: import every model file (pkgutil, see models/__init__.py), then create tables.
    from db import Base, engine  # noqa: PLC0415

    import models  # noqa: F401, PLC0415

    Base.metadata.create_all(bind=engine)
    log.info("database ready: %s", engine.url)
    yield


app = FastAPI(title="MoveLingo API", version="1.0", lifespan=lifespan)

# CORS allows http://localhost:3000 (CONTRACT.md section 2). X-User-Id must be
# an explicitly allowed header: wildcards are not honoured on credentialed requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["content-type", "x-user-id", "accept", "authorization"],
)


@app.exception_handler(RequestValidationError)
async def _validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    first = errors[0] if errors else {}
    loc = ".".join(str(part) for part in first.get("loc", ()) if part != "body") or "request"
    return error_response(422, "validation_error", f"{loc}: {first.get('msg', 'Invalid request')}")


@app.exception_handler(StarletteHTTPException)
async def _http_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail
    # Handlers may raise HTTPException(status, {"code": ..., "message": ...}) for a custom code.
    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        return error_response(exc.status_code, str(detail["code"]), str(detail["message"]))
    code = STATUS_CODES.get(exc.status_code, f"http_{exc.status_code}")
    message = detail if isinstance(detail, str) else "Request failed"
    return error_response(exc.status_code, code, message)


@app.exception_handler(Exception)
async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
    log.exception("unhandled error on %s %s", request.method, request.url.path)
    return error_response(500, "internal_error", "Internal server error")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _register_routers(app: FastAPI) -> None:
    """Import every module in routers/ and mount its `router` (frozen at B0).

    A router may declare paths relative ("/users") or already prefixed
    ("/api/users"); both styles mount under /api and the choice is logged, so
    nobody needs to edit this file to add a router.
    """
    routers_dir = API_DIR / "routers"
    for info in pkgutil.iter_modules([str(routers_dir)]):
        if info.name == "__init__":
            continue
        try:
            module = importlib.import_module(f"routers.{info.name}")
        except Exception:  # noqa: BLE001 - one broken router must never block the others
            log.exception("router %s failed to import - skipping", info.name)
            continue
        router = getattr(module, "router", None)
        if router is None:
            log.info("routers/%s.py has no `router` - skipped", info.name)
            continue
        paths = [route.path for route in router.routes]
        prefixed = [p for p in paths if p.startswith("/api")]
        if prefixed and len(prefixed) != len(paths):
            log.warning("router %s mixes /api and relative paths: %s", info.name, paths)
        try:
            if prefixed:
                app.include_router(router)
                style = "paths already /api"
            else:
                app.include_router(router, prefix="/api")
                style = "prefix /api added"
        except Exception:  # noqa: BLE001
            log.exception("router %s failed to mount - skipping", info.name)
            continue
        log.info("router %-12s mounted (%s): %s", info.name, style, ", ".join(paths) or "no routes")


_register_routers(app)
