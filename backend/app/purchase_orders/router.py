import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.auth import get_current_user
from app.purchase_orders.models import PurchaseOrder

router = APIRouter(prefix="/api/purchase_orders", tags=["purchase_orders"])

class POCreate(BaseModel):
    vendor_name: str
    items_requested: List[str]

class POStatusUpdate(BaseModel):
    status: str

@router.post("")
async def create_purchase_order(po: POCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_po = PurchaseOrder(
            vendor_name=po.vendor_name,
            items_requested=json.dumps(po.items_requested)
        )
        db.add(db_po)
        db.commit()
        db.refresh(db_po)
        return {"status": "success", "id": db_po.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create purchase order")

@router.get("")
async def get_purchase_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()
    pos = []
    for row in rows:
        d = {c.name: getattr(row, c.name) for c in row.__table__.columns}
        try:
            d["items_requested"] = json.loads(d.get("items_requested") or "[]")
        except Exception:
            d["items_requested"] = []
        pos.append(d)
    return pos

@router.patch("/{po_id}")
async def update_po_status(po_id: int, update: POStatusUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    try:
        po.status = update.status
        db.commit()
        return {"status": "success", "id": po_id, "new_status": update.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update purchase order")
