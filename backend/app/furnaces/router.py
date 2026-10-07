from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.furnaces import schemas, service
from app.auth import get_current_user

router = APIRouter(prefix="/furnaces", tags=["furnaces"])

@router.get("/", response_model=List[schemas.FurnaceResponse])
def get_furnaces(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all furnaces"""
    return service.get_furnaces(db, skip=skip, limit=limit)

@router.get("/{furnace_id}", response_model=schemas.FurnaceResponse)
def get_furnace(furnace_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific furnace by ID"""
    furnace = service.get_furnace(db, furnace_id=furnace_id)
    if not furnace:
        raise HTTPException(status_code=404, detail="Furnace not found")
    return furnace

@router.post("/", response_model=schemas.FurnaceResponse, status_code=201)
def create_furnace(furnace_in: schemas.FurnaceCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a new furnace"""
    try:
        return service.create_furnace(db=db, furnace_in=furnace_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A furnace with this SKU already exists")

@router.put("/{furnace_id}", response_model=schemas.FurnaceResponse)
def update_furnace(furnace_id: int, furnace_in: schemas.FurnaceUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Update an existing furnace and its specs"""
    try:
        updated_furnace = service.update_furnace(db, furnace_id, furnace_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A furnace with this SKU already exists")
    if not updated_furnace:
        raise HTTPException(status_code=404, detail="Furnace not found")
    return updated_furnace

@router.delete("/{furnace_id}", status_code=204)
def delete_furnace(furnace_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Delete a furnace (cascade deletes its technical specs)"""
    deleted = service.delete_furnace(db, furnace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Furnace not found")
    return None
