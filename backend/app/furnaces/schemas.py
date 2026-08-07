import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


# ── Technical Specs ────────────────────────────────────────────────────────────

class TechnicalSpecsBase(BaseModel):
    specific_max_temp:    Optional[str] = None
    heating_element:      Optional[str] = None
    thermocouple:         Optional[str] = None
    electrical_phase:     Optional[str] = None
    insulation:           Optional[str] = None
    dimensions:           Optional[str] = None
    max_temperature:      Optional[str] = None   # backward-compat alias
    power_rating:         Optional[str] = None   # backward-compat alias
    precision_control:    Optional[str] = None
    structural_integrity: Optional[str] = None

class TechnicalSpecsCreate(TechnicalSpecsBase):
    pass

class TechnicalSpecsUpdate(TechnicalSpecsBase):
    pass

class TechnicalSpecsResponse(TechnicalSpecsBase):
    id:                   int
    furnace_id:           int

    model_config = ConfigDict(from_attributes=True)


# ── Furnace ────────────────────────────────────────────────────────────────────

class FurnaceBase(BaseModel):
    sku:               Optional[str] = None
    product_id:        Optional[str] = None
    name:              Optional[str] = None
    category:          Optional[str] = None
    material:          Optional[str] = None
    fuel:              Optional[str] = None
    operation:         Optional[str] = None
    temp_text:         Optional[str] = None
    max_temp_val:      Optional[float] = None
    description:       Optional[str] = None
    short_description: Optional[str] = None
    is_active:         Optional[bool] = True

class FurnaceCreate(FurnaceBase):
    specs:             Optional[TechnicalSpecsCreate] = None

    @field_validator('*', mode='before')
    @classmethod
    def check_html(cls, v):
        if isinstance(v, str) and re.search(r'<[^>]+>', v):
            raise ValueError("Invalid input: HTML tags are not allowed.")
        return v

class FurnaceUpdate(FurnaceBase):
    specs:             Optional[TechnicalSpecsUpdate] = None

    @field_validator('*', mode='before')
    @classmethod
    def check_html(cls, v):
        if isinstance(v, str) and re.search(r'<[^>]+>', v):
            raise ValueError("Invalid input: HTML tags are not allowed.")
        return v

class FurnaceResponse(FurnaceBase):
    id:                int
    specs:             Optional[TechnicalSpecsResponse] = None

    model_config = ConfigDict(from_attributes=True)
