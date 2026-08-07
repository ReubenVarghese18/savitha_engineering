from sqlalchemy.orm import Session
from app.furnaces.models import Furnace, TechnicalSpecs
from app.furnaces import schemas

def get_furnaces(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Furnace).offset(skip).limit(limit).all()

def get_furnace(db: Session, furnace_id: int):
    return db.query(Furnace).filter(Furnace.id == furnace_id).first()

def create_furnace(db: Session, furnace_in: schemas.FurnaceCreate):
    furnace_data = furnace_in.model_dump(exclude={"specs"})
    db_furnace = Furnace(**furnace_data)
    db.add(db_furnace)
    db.commit()
    db.refresh(db_furnace)
    
    if furnace_in.specs:
        specs_data = furnace_in.specs.model_dump()
        db_specs = TechnicalSpecs(**specs_data, furnace_id=db_furnace.id)
        db.add(db_specs)
        db.commit()
        db.refresh(db_furnace)
        
    return db_furnace

def update_furnace(db: Session, furnace_id: int, furnace_in: schemas.FurnaceUpdate):
    db_furnace = db.query(Furnace).filter(Furnace.id == furnace_id).first()
    if not db_furnace:
        return None
    
    update_data = furnace_in.model_dump(exclude_unset=True)
    if "specs" in update_data:
        specs_data = update_data.pop("specs")
        if specs_data is not None:
            if db_furnace.specs:
                for k, v in specs_data.items():
                    setattr(db_furnace.specs, k, v)
            else:
                db_specs = TechnicalSpecs(**specs_data, furnace_id=db_furnace.id)
                db.add(db_specs)
    
    for k, v in update_data.items():
        setattr(db_furnace, k, v)
        
    db.commit()
    db.refresh(db_furnace)
    return db_furnace

def delete_furnace(db: Session, furnace_id: int):
    db_furnace = db.query(Furnace).filter(Furnace.id == furnace_id).first()
    if db_furnace:
        db.delete(db_furnace)
        db.commit()
    return db_furnace
