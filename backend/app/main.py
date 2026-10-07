import re
import os
import sentry_sdk
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Request, BackgroundTasks
from app.notifications import send_quote_alert
from pydantic import BaseModel, field_validator
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter
from dotenv import load_dotenv

load_dotenv()

# Import engine and Base
from app.database import engine, Base

# Import models so they are registered with Base.metadata before create_all
import app.furnaces.models
import app.enquiries.models
import app.quotes.models
import app.purchase_orders.models
from app.quotes.models import Quote
from app.database import get_db
from sqlalchemy.orm import Session

# Import routers
from app.furnaces.router import router as furnaces_router
from app.enquiries.router import router as enquiries_router
from app.purchase_orders.router import router as po_router
from app.auth import router as auth_router, get_current_user

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Initialize Sentry
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)

app = FastAPI(title="Savitha Industrial Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 1. SECURITY GATE: Configure CORS from environment
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. THE BLUEPRINT: Tell Swagger exactly what data to expect
class QuoteRequest(BaseModel):
    full_name: str
    company: str
    category: str
    requirement_details: str
    requested_assets: List[str] = []
    is_custom_request: bool = False
    custom_details: str | None = None
    equipment_serial_number: str | None = None

# 3. THE ENDPOINT: Where the frontend sends the data (public endpoint for customer quotes)
@app.post("/api/quotes")
@limiter.limit("10/minute")
async def receive_quote(request: Request, quote: QuoteRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    import json
    try:
        assets_json = json.dumps(quote.requested_assets or [])
        db_quote = Quote(
            full_name=quote.full_name,
            company=quote.company,
            category=quote.category,
            requirement_details=quote.requirement_details,
            requested_assets=assets_json,
            is_custom_request=quote.is_custom_request,
            custom_details=quote.custom_details,
            equipment_serial_number=quote.equipment_serial_number
        )
        db.add(db_quote)
        db.commit()
        db.refresh(db_quote)
        background_tasks.add_task(send_quote_alert, {
            "id": db_quote.id,
            "full_name": quote.full_name,
            "company": quote.company,
            "category": quote.category,
            "requirement_details": quote.requirement_details,
            "requested_assets": quote.requested_assets,
            "is_custom_request": quote.is_custom_request,
        })
        return {"status": "success", "message": "Quote processing initiated", "quote_id": db_quote.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process quote")

@app.get("/api/quotes")
async def get_quotes(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Quote).order_by(Quote.created_at.desc()).all()
    import json
    quotes = []
    for row in rows:
        d = {c.name: getattr(row, c.name) for c in row.__table__.columns}
        try:
            d["requested_assets"] = json.loads(d.get("requested_assets") or "[]")
        except Exception:
            d["requested_assets"] = []
        quotes.append(d)
    return quotes

@app.get("/api/quotes/{quote_id}")
async def get_quote(quote_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(Quote).filter(Quote.id == quote_id).first()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Quote not found")
        
    import json
    d = {c.name: getattr(row, c.name) for c in row.__table__.columns}
    try:
        d["requested_assets"] = json.loads(d.get("requested_assets") or "[]")
    except Exception:
        d["requested_assets"] = []
    
    return d

class QuoteStatusUpdate(BaseModel):
    status: str

@app.patch("/api/quotes/{quote_id}")
async def update_quote_status(quote_id: int, update: QuoteStatusUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    try:
        quote.status = update.status
        db.commit()
        return {"status": "success", "id": quote_id, "new_status": update.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update quote")

class QuoteTerms(BaseModel):
    base_price: str
    lead_time: str
    payment_terms: str
    notes: str

    @field_validator('*', mode='before')
    @classmethod
    def check_html(cls, v):
        if isinstance(v, str) and re.search(r'<[^>]+>', v):
            raise ValueError("Invalid input: HTML tags are not allowed.")
        return v

@app.patch("/api/quotes/{quote_id}/draft")
async def save_quote_draft(quote_id: int, terms: QuoteTerms, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    try:
        quote.base_price = terms.base_price
        quote.lead_time = terms.lead_time
        quote.payment_terms = terms.payment_terms
        quote.notes = terms.notes
        db.commit()
        return {"status": "success", "message": "Draft saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save draft")

@app.post("/api/quotes/{id}/generate-pdf")
async def generate_quote_pdf(id: int, terms: QuoteTerms, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    import json
    from fastapi import Response
    from app.furnaces.models import Furnace
    from app.quote_pdf import build_quote_pdf

    quote = db.query(Quote).filter(Quote.id == id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    try:
        skus = json.loads(quote.requested_assets or "[]")
    except (json.JSONDecodeError, TypeError):
        skus = []
    names = {f.sku: f.name for f in db.query(Furnace).filter(Furnace.sku.in_(skus)).all()} if skus else {}
    products = [{"sku": sku, "name": names.get(sku)} for sku in skus]

    pdf_bytes = build_quote_pdf(
        {"id": quote.id, "full_name": quote.full_name, "company": quote.company},
        terms.model_dump(),
        products,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Quote_{id}.pdf"},
    )


@app.get("/sitemap.xml")
async def generate_sitemap():
    from app.database import SessionLocal
    from app.furnaces import service
    from fastapi import Response
    
    db = SessionLocal()
    try:
        furnaces = service.get_furnaces(db, skip=0, limit=1000)
        xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        site_url = os.getenv("SITE_URL", "https://savithaengineering.com").rstrip("/")

        # Add static routes
        xml_content += f"  <url>\n    <loc>{site_url}/</loc>\n  </url>\n"
        xml_content += f"  <url>\n    <loc>{site_url}/products</loc>\n  </url>\n"

        # Add dynamic furnace routes
        for f in furnaces:
            if f.is_active is not False:
                slug = f.sku if f.sku else str(f.id)
                xml_content += f"  <url>\n    <loc>{site_url}/products/{slug}</loc>\n  </url>\n"
                
        xml_content += '</urlset>'
        return Response(content=xml_content, media_type="application/xml")
    finally:
        db.close()

# Include routers
app.include_router(furnaces_router)
app.include_router(enquiries_router)
app.include_router(po_router)
app.include_router(auth_router)


