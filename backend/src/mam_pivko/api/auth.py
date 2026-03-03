from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from mam_pivko.config import settings

_bearer = HTTPBearer()


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> str:
    try:
        idinfo: dict[str, object] = id_token.verify_oauth2_token(
            credentials.credentials,
            google_requests.Request(),
            settings.google_client_id,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e

    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Email not verified")

    email = str(idinfo.get("email", ""))
    if email not in settings.allowed_emails_list():
        raise HTTPException(status_code=403, detail="Not authorized")

    return email


router = APIRouter(prefix="/api/v1", tags=["members"])


@router.get("/members", response_model=list[str])
def list_members(_: str = Depends(require_auth)) -> list[str]:
    return settings.allowed_emails_list()
