from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.enquiries.models import Enquiry
from app.enquiries.schemas import EnquiryCreate
from app.furnaces.models import Furnace

def create_enquiry(db: Session, enquiry: EnquiryCreate):
    # Verify the furnace exists before creating an enquiry
    furnace = db.query(Furnace).filter(Furnace.id == enquiry.furnace_id).first()
    if not furnace:
        raise HTTPException(status_code=404, detail="Furnace not found. Cannot create enquiry.")
        
    db_enquiry = Enquiry(**enquiry.model_dump())
    db.add(db_enquiry)
    db.commit()
    db.refresh(db_enquiry)
    return db_enquiry
