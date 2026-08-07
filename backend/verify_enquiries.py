from app.database import SessionLocal
from app.enquiries.models import Enquiry
from app.furnaces.models import Furnace

def verify_enquiries():
    db = SessionLocal()
    enquiries = db.query(Enquiry).all()
    print("--- Enquiries Database Verification ---")
    for eq in enquiries:
        print(f"Enquiry ID : {eq.id}")
        print(f"Client Name: {eq.client_name}")
        print(f"Company    : {eq.company}")
        print(f"Email      : {eq.email}")
        print(f"Furnace ID : {eq.furnace_id}")
        print(f"Message    : {eq.message}")
        print("-" * 50)
    db.close()

if __name__ == '__main__':
    verify_enquiries()
