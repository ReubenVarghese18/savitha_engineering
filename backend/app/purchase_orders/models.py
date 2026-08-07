from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, nullable=False)
    items_requested = Column(Text, nullable=False) # Stored as JSON string
    status = Column(String, default="Draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
