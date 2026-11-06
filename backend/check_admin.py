from getpass import getpass
from app.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password

email = input("Admin email: ").strip().lower()
password = getpass("Admin password: ")

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == email).first()
    print("Account found:", user is not None)

    if user:
        print("Admin role:", user.is_admin)
        print("Account active:", user.is_active)
        print("Password matches:", verify_password(password, user.hashed_password))
finally:
    db.close()
