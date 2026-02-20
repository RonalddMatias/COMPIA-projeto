"""
Test script for COMPIA API authentication system.
Tests login, user creation and access with different roles.
"""

import requests
import json
from typing import Dict, Optional

BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self):
        self.token: Optional[str] = None
        self.current_user: Optional[Dict] = None
    
    def print_response(self, title: str, response: requests.Response):
        """Prints response in formatted way"""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        except:
            print(f"Response: {response.text}")
    
    def login(self, username: str, password: str) -> bool:
        """Logs in and stores the token"""
        print(f"\nAttempting login as: {username}")
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": username, "password": password}
        )
        
        self.print_response(f"Login as {username}", response)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            print(f"Login successful! Token obtained.")
            return True
        else:
            print(f"Login failed!")
            return False
    
    def get_current_user(self) -> Optional[Dict]:
        """Gets current user information"""
        if not self.token:
            print("No token available. Please login first.")
            return None
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("Current User", response)
        
        if response.status_code == 200:
            self.current_user = response.json()
            return self.current_user
        return None
    
    def register_user(self, username: str, email: str, password: str, role: str = "VENDEDOR"):
        """Registers a new user"""
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "username": username,
                "email": email,
                "password": password,
                "role": role
            }
        )
        
        self.print_response(f"Register user: {username} ({role})", response)
        return response.status_code == 201
    
    def create_product(self, title: str, price: float, category_id: int):
        """Tries to create a product (requires editor or admin)"""
        if not self.token:
            print("No token available. Please login first.")
            return False
        
        response = requests.post(
            f"{BASE_URL}/products",
            json={
                "title": title,
                "description": "Test product",
                "price": price,
                "stock_quantity": 10,
                "product_type": "PHYSICAL",
                "category_id": category_id
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response(f"Create product: {title}", response)
        return response.status_code == 200
    
    def delete_product(self, product_id: int):
        """Tries to delete a product (requires admin)"""
        if not self.token:
            print("No token available. Please login first.")
            return False
        
        response = requests.delete(
            f"{BASE_URL}/products/{product_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response(f"Delete product ID: {product_id}", response)
        return response.status_code == 204
    
    def list_users(self):
        """Lists all users (requires admin)"""
        if not self.token:
            print("No token available. Please login first.")
            return False
        
        response = requests.get(
            f"{BASE_URL}/auth/users",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("List all users", response)
        return response.status_code == 200
    
    def checkout(self, items: list):
        """Processes an order"""
        if not self.token:
            print("No token available. Please login first.")
            return False
        
        response = requests.post(
            f"{BASE_URL}/orders/checkout",
            json={"items": items},
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("Checkout", response)
        return response.status_code == 200

def run_tests():
    """Runs test suite"""
    tester = APITester()
    
    print("\n" + "="*60)
    print("STARTING AUTHENTICATION SYSTEM TESTS")
    print("="*60)
    
    # Test 1: Login as Admin
    print("\n" + "─"*60)
    print("TEST 1: Login as Administrator")
    print("─"*60)
    if tester.login("admin", "admin123"):
        tester.get_current_user()
    
    # Test 2: List users (admin)
    print("\n" + "─"*60)
    print("TEST 2: List users (as admin)")
    print("─"*60)
    tester.list_users()
    
    # Test 3: Create product (admin)
    print("\n" + "─"*60)
    print("TEST 3: Create product (as admin)")
    print("─"*60)
    tester.create_product("Admin Test Book", 99.90, 1)
    
    # Test 4: Register editor
    print("\n" + "─"*60)
    print("TEST 4: Register new editor")
    print("─"*60)
    tester.register_user("editor1", "editor@compia.com", "editor123", "EDITOR")
    
    # Test 5: Login as editor
    print("\n" + "─"*60)
    print("TEST 5: Login as Editor")
    print("─"*60)
    if tester.login("editor1", "editor123"):
        tester.get_current_user()
    
    # Test 6: Create product (editor)
    print("\n" + "─"*60)
    print("TEST 6: Create product (as editor)")
    print("─"*60)
    tester.create_product("Editor Test Book", 89.90, 1)
    
    # Test 7: Try to delete product (editor - should fail)
    print("\n" + "─"*60)
    print("TEST 7: Try to delete product (as editor - should FAIL)")
    print("─"*60)
    tester.delete_product(1)
    
    # Test 8: Try to list users (editor - should fail)
    print("\n" + "─"*60)
    print("TEST 8: Try to list users (as editor - should FAIL)")
    print("─"*60)
    tester.list_users()
    
    # Test 9: Register seller
    print("\n" + "─"*60)
    print("TEST 9: Register new seller")
    print("─"*60)
    # Login as admin first
    tester.login("admin", "admin123")
    tester.register_user("vendedor1", "vendedor@compia.com", "vende123", "VENDEDOR")
    
    # Test 10: Login as seller
    print("\n" + "─"*60)
    print("TEST 10: Login as Seller")
    print("─"*60)
    if tester.login("vendedor1", "vende123"):
        tester.get_current_user()
    
    # Test 11: Try to create product (seller - should fail)
    print("\n" + "─"*60)
    print("TEST 11: Try to create product (as seller - should FAIL)")
    print("─"*60)
    tester.create_product("Seller Test Book", 79.90, 1)
    
    # Test 12: Checkout (seller - should work)
    print("\n" + "─"*60)
    print("TEST 12: Checkout (as seller - should WORK)")
    print("─"*60)
    tester.checkout([{"product_id": 1, "quantity": 1}])
    
    # Test 13: Register client (default role)
    print("\n" + "─"*60)
    print("TEST 13: Register new client (default role)")
    print("─"*60)
    # Login as admin first
    tester.login("admin", "admin123")
    tester.register_user("cliente1", "cliente@compia.com", "cliente123")
    
    # Test 14: Login as client
    print("\n" + "─"*60)
    print("TEST 14: Login as Client")
    print("─"*60)
    if tester.login("cliente1", "cliente123"):
        tester.get_current_user()
    
    # Test 15: Client checkout (should work)
    print("\n" + "─"*60)
    print("TEST 15: Client checkout (should WORK)")
    print("─"*60)
    tester.checkout([{"product_id": 1, "quantity": 1}])
    
    # Test 16: Client try to create product (should fail)
    print("\n" + "─"*60)
    print("TEST 16: Client try to create product (should FAIL)")
    print("─"*60)
    tester.create_product("Client Test Book", 69.90, 1)
    
    print("\n" + "="*60)
    print("TESTS COMPLETED!")
    print("="*60)
    print("\nExpected summary:")
    print("  Admin: Can do everything")
    print("  Editor: Can create/edit products, but not delete or manage users")
    print("  Seller: Can checkout, but not manage products")
    print("  Client: Can view products and checkout, but not manage content")
    print("\n")

if __name__ == "__main__":
    try:
        run_tests()
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to server!")
        print("   Make sure the server is running at http://localhost:8000")
        print("   Run: uvicorn main:app --reload")
    except Exception as e:
        print(f"\nERROR: {e}")
