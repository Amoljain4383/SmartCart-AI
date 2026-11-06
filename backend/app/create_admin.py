from getpass import getpass
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.utils.security import hash_password

Base.metadata.create_all(bind=engine)


def main():
    print("Create the private SmartCart AI administrator account")
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password (minimum 12 characters): ")

    if len(name) < 2 or len(password) < 12:
        raise SystemExit("Name must contain at least 2 characters and password at least 12.")

    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise SystemExit("This email already exists. No account was changed.")

        admin = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Administrator account created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
