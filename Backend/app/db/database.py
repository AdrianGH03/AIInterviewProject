# loads environment variables
# reads DATABASE_URL
# creates the SQLAlchemy engine
# creates a session factory
# defines your base model class

from sqlalchemy import create_engine, text #create_engine is used to create a connection to the database
from sqlalchemy.orm import DeclarativeBase, sessionmaker #DeclarativeBase tracks metadata (tables, columns, relationships), Sessions = how you run queries
from app.config import settings #import settings from config.py to access DATABASE_URL
from sqlalchemy.exc import SQLAlchemyError


class Base(DeclarativeBase): #Creates base class for all models/schemas
    pass


engine = create_engine(settings.DATABASE_URL, echo=True) #Creates a connection from the settings in config.py's DATABASE_URL. echo=True logs all SQL statements to the console for debugging purposes.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
#Creates a session factory. autocommit=False means that changes won't be commited, where autoflush=False means that changes won't be flushed to the database until you explicitly call session.commit().
# bind=engine means that the session will use the engine we created to connect to the database. 

try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Database connection successful")
except SQLAlchemyError as e:
    print(f"Database connection failed: {e}")
