import os
import tempfile

# Must run before `app` is imported: point the app at a throwaway database.
_tmp = tempfile.mkdtemp()
os.environ.update({
    "DATABASE_URL": os.environ.get("TEST_DATABASE_URL") or f"sqlite:///{_tmp}/test.db".replace("\\", "/"),
    "SECRET_KEY": "test-secret",
    "ADMIN_USERNAME": "admin",
    "ADMIN_PASSWORD": "test-password",
    "SENTRY_DSN": "",
    "SMTP_HOST": "",
    "QUOTE_ALERT_TO": "",
})

import pytest
from fastapi.testclient import TestClient

from app.limiter import limiter
from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    limiter.reset()


@pytest.fixture(scope="session")
def auth(client):
    limiter.reset()
    r = client.post("/api/login", data={"username": "admin", "password": "test-password"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
