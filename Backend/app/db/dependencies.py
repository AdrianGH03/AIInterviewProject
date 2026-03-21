from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.database import SessionLocal

#This is basically a connection request to the db, allowing requests to make a session using the database to 
# query/insert/update the database. Yield means its a generator function, in this case, it generates a db session.
# After its called and the function runs, its cleaned up with the db.close() so no leaks.
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal() #session local is a variable in database.py that creates the db session
    try:
        yield db
    finally:
        db.close()
