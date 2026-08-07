from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    company = Column(String)
    email = Column(String)
    furnace_id = Column(Integer, ForeignKey("furnaces.id"))
    message = Column(Text)

    furnace = relationship("Furnace", back_populates="enquiries")
