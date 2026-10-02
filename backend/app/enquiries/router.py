from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.enquiries import schemas, service
from app.auth import get_current_user

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

@router.post("/", response_model=schemas.EnquiryResponse, status_code=201)
def create_enquiry(enquiry: schemas.EnquiryCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new enquiry for a furnace (authenticated admin only)"""
    try:
        return service.create_enquiry(db, enquiry=enquiry)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create enquiry")
