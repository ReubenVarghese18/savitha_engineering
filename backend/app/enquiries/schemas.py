from pydantic import BaseModel, ConfigDict

class EnquiryCreate(BaseModel):
    client_name: str
    company: str
    email: str
    furnace_id: int
    message: str

class EnquiryResponse(EnquiryCreate):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
