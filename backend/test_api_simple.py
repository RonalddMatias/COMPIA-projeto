from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import models
import os

# Create a test database or just use the dev one for now (since it's early dev)
# ideally we use a separate test db, but for quick verification dev db is fine if we clean up or just ignore.

client = TestClient(app)

def test_create_category():
    response = client.post(
        "/categories/",
        json={"name": "IA Basics", "slug": "ia-basics", "description": "Introductory books"}
    )
    if response.status_code == 200:
        print("Category created:", response.json())
        return response.json()['id']
    else:
        print("Failed to create category:", response.text)
        return None

def test_create_product(category_id):
    if not category_id:
        print("Skipping product test due to missing category.")
        return

    response = client.post(
        "/products/",
        json={
            "title": "Deep Learning Book",
            "description": " The Bible of DL",
            "price": 50.0,
            "stock_quantity": 10,
            "category_id": category_id,
            "product_type": "PHYSICAL"
        }
    )
    if response.status_code == 200:
        print("Product created:", response.json())
    else:
        print("Failed to create product:", response.text)

def test_read_products():
    response = client.get("/products/")
    if response.status_code == 200:
        print("Products list:", response.json())
    else:
        print("Failed to read products:", response.text)

if __name__ == "__main__":
    print("Testing API...")
    try:
        cat_id = test_create_category()
        test_create_product(cat_id)
        test_read_products()
        print("API Test Completed.")
    except Exception as e:
        print(f"Test failed with exception: {e}")
