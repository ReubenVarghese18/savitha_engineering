from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Furnace(Base):
    __tablename__ = "furnaces"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sku          = Column(String, unique=True, index=True)      # e.g. "SE-MELT-001"
    product_id   = Column(String, index=True)                   # same as sku in current data
    name         = Column(String, index=True)                   # product title
    category     = Column(String, index=True)
    material     = Column(String)
    fuel         = Column(String)
    operation    = Column(String)
    temp_text    = Column(String)                               # human-readable range label
    max_temp_val = Column(Float)                                # numeric max degC
    description  = Column(Text)
    short_description = Column(Text)
    is_active    = Column(Integer, default=1)

    specs      = relationship("TechnicalSpecs", back_populates="furnace", uselist=False,
                              cascade="all, delete-orphan")
    enquiries  = relationship("Enquiry", back_populates="furnace")

class TechnicalSpecs(Base):
    __tablename__ = "technical_specs"

    id                   = Column(Integer, primary_key=True, index=True, autoincrement=True)
    furnace_id           = Column(Integer, ForeignKey("furnaces.id"), unique=True)
    specific_max_temp    = Column(String)
    heating_element      = Column(String)
    thermocouple         = Column(String)
    electrical_phase     = Column(String)
    insulation           = Column(String)
    dimensions           = Column(String)
    max_temperature      = Column(String)    # kept for backward compat
    power_rating         = Column(String)    # kept for backward compat
    precision_control    = Column(Text)
    structural_integrity = Column(Text)

    furnace = relationship("Furnace", back_populates="specs")
