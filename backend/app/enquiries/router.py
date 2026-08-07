from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.enquiries import schemas, service

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

@router.post("/", response_model=schemas.EnquiryResponse, status_code=201)
def create_enquiry(enquiry: schemas.EnquiryCreate, db: Session = Depends(get_db)):
    """Create a new enquiry for a furnace"""
    return service.create_enquiry(db, enquiry=enquiry)
