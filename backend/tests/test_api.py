import uuid

import pytest

import app.main as main_module


def _sku():
    return "T-" + uuid.uuid4().hex[:8].upper()


def _furnace(auth, client, **overrides):
    body = {"sku": _sku(), "name": "Test Furnace", "category": "Test", "is_active": True,
            "specs": {"heating_element": "Kanthal"}}
    body.update(overrides)
    r = client.post("/furnaces/", json=body, headers=auth)
    assert r.status_code == 201, r.text
    return r.json()


QUOTE = {"full_name": "Asha", "company": "Acme", "email": "Asha@Example.com", "category": "Furnaces",
         "requirement_details": "Need a box furnace", "requested_assets": ["SE-1", "SE-2"]}


# ── Auth ──────────────────────────────────────────────────────────────────────

def test_login_succeeds_with_correct_credentials(client):
    r = client.post("/api/login", data={"username": "admin", "password": "test-password"})
    assert r.status_code == 200 and r.json()["token_type"] == "bearer"


def test_login_rejects_wrong_password_and_unknown_user_identically(client):
    wrong = client.post("/api/login", data={"username": "admin", "password": "nope"})
    unknown = client.post("/api/login", data={"username": "ghost", "password": "nope"})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_login_is_rate_limited(client):
    codes = [client.post("/api/login", data={"username": "admin", "password": "x"}).status_code
             for _ in range(6)]
    assert codes[:5] == [401] * 5 and codes[5] == 429


@pytest.mark.parametrize("method,path,body", [
    ("get", "/api/quotes", None),
    ("get", "/api/quotes/1", None),
    ("patch", "/api/quotes/1", {"status": "X"}),
    ("get", "/api/purchase_orders", None),
    ("post", "/api/purchase_orders", {"vendor_name": "V", "items_requested": ["a"]}),
    ("post", "/enquiries/", {"client_name": "a", "company": "b", "email": "c", "furnace_id": 1, "message": "m"}),
    ("post", "/furnaces/", {"name": "x"}),
    ("put", "/furnaces/1", {"name": "x"}),
    ("delete", "/furnaces/1", None),
])
def test_protected_endpoints_reject_missing_and_bad_tokens(client, method, path, body):
    kwargs = {"json": body} if body is not None else {}
    assert getattr(client, method)(path, **kwargs).status_code == 401
    bad = {"Authorization": "Bearer not.a.token"}
    assert getattr(client, method)(path, headers=bad, **kwargs).status_code == 401


# ── Quotes ────────────────────────────────────────────────────────────────────

def test_public_quote_submission_and_admin_review(client, auth):
    r = client.post("/api/quotes", json=QUOTE)
    assert r.status_code == 200
    qid = r.json()["quote_id"]

    got = client.get(f"/api/quotes/{qid}", headers=auth).json()
    assert got["company"] == "Acme" and got["requested_assets"] == ["SE-1", "SE-2"]
    assert any(q["id"] == qid for q in client.get("/api/quotes", headers=auth).json())

    assert client.patch(f"/api/quotes/{qid}", json={"status": "Designing"}, headers=auth).status_code == 200
    assert client.get(f"/api/quotes/{qid}", headers=auth).json()["status"] == "Designing"


def test_quote_requires_mandatory_fields(client):
    assert client.post("/api/quotes", json={"full_name": "x"}).status_code == 422


def test_quote_stores_contact_details_normalised(client, auth):
    qid = client.post("/api/quotes", json=dict(QUOTE, phone="+91 98765 43210")).json()["quote_id"]
    got = client.get(f"/api/quotes/{qid}", headers=auth).json()
    assert got["email"] == "asha@example.com" and got["phone"] == "+91 98765 43210"


def test_quote_needs_at_least_one_contact_method(client):
    no_contact = {k: v for k, v in QUOTE.items() if k != "email"}
    assert client.post("/api/quotes", json=no_contact).status_code == 422
    assert client.post("/api/quotes", json=dict(no_contact, email="   ", phone="")).status_code == 422


def test_quote_accepts_phone_only(client):
    no_email = {k: v for k, v in QUOTE.items() if k != "email"}
    assert client.post("/api/quotes", json=dict(no_email, phone="022-4444 5555")).status_code == 200


@pytest.mark.parametrize("overrides", [
    {"email": "not-an-email"},
    {"email": "a b@c.com"},
    {"email": "a@b.com\r\nBcc: evil@x.test"},
    {"phone": "abc"},
    {"phone": "12"},
    {"full_name": "   "},
    {"company": ""},
    {"requirement_details": "   "},
    {"full_name": "x" * 121},
    {"requirement_details": "x" * 5001},
    {"requested_assets": ["SKU"] * 51},
    {"requested_assets": ["x" * 51]},
])
def test_quote_rejects_invalid_or_oversized_fields(client, overrides):
    assert client.post("/api/quotes", json=dict(QUOTE, **overrides)).status_code == 422


def test_alert_email_has_contact_details_reply_to_and_no_header_injection(monkeypatch):
    import app.notifications as notifications
    sent = []

    class FakeSMTP:
        def __init__(self, *a, **k): pass
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def starttls(self): pass
        def login(self, *a): pass
        def send_message(self, msg): sent.append(msg)

    monkeypatch.setattr(notifications.smtplib, "SMTP", FakeSMTP)
    monkeypatch.setenv("SMTP_HOST", "smtp.test")
    monkeypatch.setenv("QUOTE_ALERT_TO", "sales@test.local")
    notifications.send_quote_alert({"id": 7, "full_name": "Asha", "company": "Acme\r\nBcc: evil@x.test",
                                    "email": "asha@example.com", "phone": "+91 99999 99999", "category": "F",
                                    "requirement_details": "need", "requested_assets": ["SE-1"]})
    msg = sent[0]
    assert msg["Reply-To"] == "asha@example.com" and msg["Bcc"] is None
    body = msg.get_content()
    assert "Email: asha@example.com" in body and "Phone: +91 99999 99999" in body


def test_missing_quote_returns_404(client, auth):
    assert client.get("/api/quotes/999999", headers=auth).status_code == 404
    assert client.patch("/api/quotes/999999", json={"status": "X"}, headers=auth).status_code == 404


def test_quote_draft_saves_terms_and_rejects_html(client, auth):
    qid = client.post("/api/quotes", json=QUOTE).json()["quote_id"]
    terms = {"base_price": "INR 10", "lead_time": "4 weeks", "payment_terms": "50/50", "notes": "n"}
    assert client.patch(f"/api/quotes/{qid}/draft", json=terms, headers=auth).status_code == 200
    saved = client.get(f"/api/quotes/{qid}", headers=auth).json()
    assert saved["base_price"] == "INR 10" and saved["lead_time"] == "4 weeks"

    bad = dict(terms, notes="<script>alert(1)</script>")
    assert client.patch(f"/api/quotes/{qid}/draft", json=bad, headers=auth).status_code == 422


def _pdf_text(content):
    import io
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(content))
    return len(reader.pages), " ".join(page.extract_text() for page in reader.pages)


TERMS = {"base_price": "INR 12,50,000", "lead_time": "6 weeks", "payment_terms": "50% advance", "notes": "Excludes freight."}


def test_quote_pdf_contains_customer_products_and_terms(client, auth):
    f = _furnace(auth, client, name="Box Furnace 1200")
    body = dict(QUOTE, company="Acme Forge", requested_assets=[f["sku"]])
    qid = client.post("/api/quotes", json=body).json()["quote_id"]
    r = client.post(f"/api/quotes/{qid}/generate-pdf", json=TERMS, headers=auth)
    assert r.status_code == 200 and r.content.startswith(b"%PDF")
    _, text = _pdf_text(r.content)
    for expected in ("QUOTATION", f"SE-Q-{qid}", "Asha", "Acme Forge", "Box Furnace 1200", f["sku"],
                     "INR 12,50,000", "6 weeks", "50% advance", "Excludes freight."):
        assert expected in text, expected


def test_quote_pdf_wraps_long_notes_instead_of_clipping(client, auth):
    qid = client.post("/api/quotes", json=QUOTE).json()["quote_id"]
    notes = " ".join(f"caveat{i}" for i in range(400))
    r = client.post(f"/api/quotes/{qid}/generate-pdf", json=dict(TERMS, notes=notes), headers=auth)
    pages, text = _pdf_text(r.content)
    assert "caveat0" in text and "caveat399" in text and pages >= 1


def test_quote_pdf_treats_customer_text_as_plain_text(client, auth):
    qid = client.post("/api/quotes", json=dict(QUOTE, company="A & B <b>Ltd</b>")).json()["quote_id"]
    r = client.post(f"/api/quotes/{qid}/generate-pdf", json=TERMS, headers=auth)
    assert r.status_code == 200
    assert "A & B <b>Ltd</b>" in _pdf_text(r.content)[1]


def test_quote_pdf_for_missing_quote_is_404(client, auth):
    assert client.post("/api/quotes/999999/generate-pdf", json=TERMS, headers=auth).status_code == 404


def test_new_quote_triggers_alert_email(client, monkeypatch):
    sent = []
    monkeypatch.setattr(main_module, "send_quote_alert", lambda q: sent.append(q))
    qid = client.post("/api/quotes", json=QUOTE).json()["quote_id"]
    assert len(sent) == 1 and sent[0]["id"] == qid and sent[0]["company"] == "Acme"


def test_public_quote_endpoint_is_rate_limited(client):
    codes = [client.post("/api/quotes", json=QUOTE).status_code for _ in range(11)]
    assert codes[:10] == [200] * 10 and codes[10] == 429


# ── Purchase orders & enquiries ───────────────────────────────────────────────

def test_purchase_order_lifecycle(client, auth):
    r = client.post("/api/purchase_orders", json={"vendor_name": "Steel Co", "items_requested": ["bar"]}, headers=auth)
    assert r.status_code == 200
    po_id = r.json()["id"]
    listed = client.get("/api/purchase_orders", headers=auth).json()
    assert any(p["id"] == po_id and p["items_requested"] == ["bar"] for p in listed)
    assert client.patch(f"/api/purchase_orders/{po_id}", json={"status": "Ordered"}, headers=auth).status_code == 200
    assert client.patch("/api/purchase_orders/999999", json={"status": "x"}, headers=auth).status_code == 404


def test_enquiry_creation_for_existing_furnace(client, auth):
    f = _furnace(auth, client)
    body = {"client_name": "A", "company": "B", "email": "a@b.test", "furnace_id": f["id"], "message": "hi"}
    assert client.post("/enquiries/", json=body, headers=auth).status_code == 201


# ── Furnaces ──────────────────────────────────────────────────────────────────

def test_furnace_crud(client, auth):
    f = _furnace(auth, client, max_temp_val=1200.0)
    fid = f["id"]
    assert f["specs"]["heating_element"] == "Kanthal"
    assert client.get(f"/furnaces/{fid}").json()["sku"] == f["sku"]  # public read

    r = client.put(f"/furnaces/{fid}", json={"name": "Renamed", "is_active": False}, headers=auth)
    assert r.status_code == 200 and r.json()["name"] == "Renamed" and r.json()["is_active"] is False

    assert client.delete(f"/furnaces/{fid}", headers=auth).status_code == 204
    assert client.get(f"/furnaces/{fid}").status_code == 404


def test_furnace_rejects_html(client, auth):
    r = client.post("/furnaces/", json={"sku": _sku(), "name": "<b>x</b>"}, headers=auth)
    assert r.status_code == 422


def test_duplicate_sku_returns_conflict_not_server_error(client, auth):
    f = _furnace(auth, client)
    r = client.post("/furnaces/", json={"sku": f["sku"], "name": "Dup"}, headers=auth)
    assert r.status_code == 409


# ── Sitemap ───────────────────────────────────────────────────────────────────

def test_sitemap_lists_only_active_products_on_real_routes(client, auth):
    live, hidden = _furnace(auth, client), _furnace(auth, client, is_active=False)
    xml = client.get("/sitemap.xml").text
    assert f"/products/{live['sku']}</loc>" in xml
    assert hidden["sku"] not in xml
    assert "/catalog" not in xml and "/products</loc>" in xml


def test_update_to_existing_sku_returns_conflict(client, auth):
    a, b = _furnace(auth, client), _furnace(auth, client)
    r = client.put(f"/furnaces/{b['id']}", json={"sku": a["sku"]}, headers=auth)
    assert r.status_code == 409


# -- Security headers ---------------------------------------------------------

@pytest.mark.parametrize("path", ["/docs", "/api/quotes", "/furnaces/", "/sitemap.xml"])
def test_responses_carry_security_headers(client, path):
    h = client.get(path).headers
    assert h["x-content-type-options"] == "nosniff"
    assert h["x-frame-options"] == "DENY"
    assert h["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "camera=()" in h["permissions-policy"]


def test_hsts_is_off_by_default_and_opt_in(client, monkeypatch):
    assert "strict-transport-security" not in client.get("/furnaces/").headers
    monkeypatch.setenv("ENABLE_HSTS", "true")
    assert "max-age=31536000" in client.get("/furnaces/").headers["strict-transport-security"]
