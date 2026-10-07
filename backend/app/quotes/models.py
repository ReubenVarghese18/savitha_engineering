from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    category = Column(String, nullable=False)
    requirement_details = Column(Text, nullable=False)
    requested_assets = Column(Text, nullable=True) # Stored as JSON string
    
    # Existing draft terms
    base_price = Column(String, nullable=True)
    lead_time = Column(String, nullable=True)
    payment_terms = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    status = Column(String, default="PENDING")
    
    # New custom request fields
    is_custom_request = Column(Boolean, default=False)
    custom_details = Column(Text, nullable=True)
    equipment_serial_number = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
