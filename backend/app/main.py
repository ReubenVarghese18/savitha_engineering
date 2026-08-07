import sqlite3
import re
import os
import sentry_sdk
from typing import List
from fastapi import FastAPI, Depends
from pydantic import BaseModel, field_validator
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter

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

# 1. SECURITY GATE: Allow React (localhost:5173) to send data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # Your Vite frontend URLs
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

# 3. THE ENDPOINT: Where the frontend sends the data
@app.post("/api/quotes")
async def receive_quote(quote: QuoteRequest, db: Session = Depends(get_db)):
    import json
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
    return {"status": "success", "message": "Quote processing initiated"}

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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Quote not found")
    quote.status = update.status
    db.commit()
    return {"status": "success", "id": quote_id, "new_status": update.status}

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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Quote not found")
        
    quote.base_price = terms.base_price
    quote.lead_time = terms.lead_time
    quote.payment_terms = terms.payment_terms
    quote.notes = terms.notes
    db.commit()
    
    return {"status": "success", "message": "Draft saved successfully"}

@app.post("/api/quotes/{id}/generate-pdf")
async def generate_quote_pdf(id: int, terms: QuoteTerms, current_user: dict = Depends(get_current_user)):
    from fastapi import Response
    import io
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter

    buffer = io.BytesIO()
    
    # Create the PDF object, using the buffer as its "file."
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Start writing below the 150px top margin
    y_position = height - 150
    
    # "QUOTATION" in bold
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, y_position, "QUOTATION")
    
    # Add terms
    y_position -= 50
    c.setFont("Helvetica", 12)
    c.drawString(50, y_position, f"Quote ID: {id}")
    y_position -= 30
    c.drawString(50, y_position, f"Base Price: {terms.base_price}")
    y_position -= 20
    c.drawString(50, y_position, f"Lead Time: {terms.lead_time}")
    y_position -= 20
    c.drawString(50, y_position, f"Payment Terms: {terms.payment_terms}")
    y_position -= 20
    c.drawString(50, y_position, f"Notes: {terms.notes}")
    
    # Close the PDF object cleanly, and we're done.
    c.showPage()
    c.save()
    
    # Get the value of the BytesIO buffer and return it in the response
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Quote_{id}.pdf"}
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
        
        # Add static routes
        xml_content += "  <url>\n    <loc>https://savithaengineering.com/</loc>\n  </url>\n"
        xml_content += "  <url>\n    <loc>https://savithaengineering.com/catalog</loc>\n  </url>\n"
        
        # Add dynamic furnace routes
        for f in furnaces:
            if f.is_active is not False:
                slug = f.sku if f.sku else str(f.id)
                xml_content += f"  <url>\n    <loc>https://savithaengineering.com/catalog/{slug}</loc>\n  </url>\n"
                
        xml_content += '</urlset>'
        return Response(content=xml_content, media_type="application/xml")
    finally:
        db.close()

# Include routers
app.include_router(furnaces_router)
app.include_router(enquiries_router)
app.include_router(po_router)
app.include_router(auth_router)


