import sys
from database import engine, Base
import models # Ensure models are registered
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful:", result.scalar())
        
        # Verify tables creation
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
        
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print("Tables in DB:", tables)
        
        if "products" in tables and "categories" in tables:
            print("REQUIRED TABLES FOUND.")
            return True
        else:
            print("MISSING TABLES.")
            return False
            
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    if test_connection():
        sys.exit(0)
    else:
        sys.exit(1)
