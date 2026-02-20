"""
Script de teste para o sistema de autenticação da API COMPIA.
Testa login, criação de usuários e acesso com diferentes roles.
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
        """Imprime resposta de forma formatada"""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        except:
            print(f"Response: {response.text}")
    
    def login(self, username: str, password: str) -> bool:
        """Faz login e armazena o token"""
        print(f"\nTentando login como: {username}")
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": username, "password": password}
        )
        
        self.print_response(f"Login como {username}", response)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            print(f"Login bem-sucedido! Token obtido.")
            return True
        else:
            print(f"Falha no login!")
            return False
    
    def get_current_user(self) -> Optional[Dict]:
        """Obtém informações do usuário atual"""
        if not self.token:
            print("Nenhum token disponível. Faça login primeiro.")
            return None
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("Usuário Atual", response)
        
        if response.status_code == 200:
            self.current_user = response.json()
            return self.current_user
        return None
    
    def register_user(self, username: str, email: str, password: str, role: str = "vendedor"):
        """Registra um novo usuário"""
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "username": username,
                "email": email,
                "password": password,
                "role": role
            }
        )
        
        self.print_response(f"Registrar usuário: {username} ({role})", response)
        return response.status_code == 201
    
    def create_product(self, title: str, price: float, category_id: int):
        """Tenta criar um produto (requer editor ou admin)"""
        if not self.token:
            print("Nenhum token disponível. Faça login primeiro.")
            return False
        
        response = requests.post(
            f"{BASE_URL}/products",
            json={
                "title": title,
                "description": "Produto de teste",
                "price": price,
                "stock_quantity": 10,
                "product_type": "PHYSICAL",
                "category_id": category_id
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response(f"Criar produto: {title}", response)
        return response.status_code == 200
    
    def delete_product(self, product_id: int):
        """Tenta deletar um produto (requer admin)"""
        if not self.token:
            print("Nenhum token disponível. Faça login primeiro.")
            return False
        
        response = requests.delete(
            f"{BASE_URL}/products/{product_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response(f"Deletar produto ID: {product_id}", response)
        return response.status_code == 204
    
    def list_users(self):
        """Lista todos os usuários (requer admin)"""
        if not self.token:
            print("Nenhum token disponível. Faça login primeiro.")
            return False
        
        response = requests.get(
            f"{BASE_URL}/auth/users",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("Listar todos os usuários", response)
        return response.status_code == 200
    
    def checkout(self, items: list):
        """Processa um pedido"""
        if not self.token:
            print("Nenhum token disponível. Faça login primeiro.")
            return False
        
        response = requests.post(
            f"{BASE_URL}/orders/checkout",
            json={"items": items},
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        self.print_response("Checkout", response)
        return response.status_code == 200

def run_tests():
    """Executa bateria de testes"""
    tester = APITester()
    
    print("\n" + "="*60)
    print("INICIANDO TESTES DO SISTEMA DE AUTENTICACAO")
    print("="*60)
    
    # Teste 1: Login como Admin
    print("\n" + "─"*60)
    print("TESTE 1: Login como Administrador")
    print("─"*60)
    if tester.login("admin", "admin123"):
        tester.get_current_user()
    
    # Teste 2: Listar usuários (admin)
    print("\n" + "─"*60)
    print("TESTE 2: Listar usuarios (como admin)")
    print("─"*60)
    tester.list_users()
    
    # Teste 3: Criar produto (admin)
    print("\n" + "─"*60)
    print("TESTE 3: Criar produto (como admin)")
    print("─"*60)
    tester.create_product("Livro de Teste Admin", 99.90, 1)
    
    # Teste 4: Registrar editor
    print("\n" + "─"*60)
    print("TESTE 4: Registrar novo editor")
    print("─"*60)
    tester.register_user("editor1", "editor@compia.com", "editor123", "editor")
    
    # Teste 5: Login como editor
    print("\n" + "─"*60)
    print("TESTE 5: Login como Editor")
    print("─"*60)
    if tester.login("editor1", "editor123"):
        tester.get_current_user()
    
    # Teste 6: Criar produto (editor)
    print("\n" + "─"*60)
    print("TESTE 6: Criar produto (como editor)")
    print("─"*60)
    tester.create_product("Livro de Teste Editor", 89.90, 1)
    
    # Teste 7: Tentar deletar produto (editor - deve falhar)
    print("\n" + "─"*60)
    print("TESTE 7: Tentar deletar produto (como editor - deve FALHAR)")
    print("─"*60)
    tester.delete_product(1)
    
    # Teste 8: Tentar listar usuários (editor - deve falhar)
    print("\n" + "─"*60)
    print("TESTE 8: Tentar listar usuarios (como editor - deve FALHAR)")
    print("─"*60)
    tester.list_users()
    
    # Teste 9: Registrar vendedor
    print("\n" + "─"*60)
    print("TESTE 9: Registrar novo vendedor")
    print("─"*60)
    # Login como admin primeiro
    tester.login("admin", "admin123")
    tester.register_user("vendedor1", "vendedor@compia.com", "vende123", "vendedor")
    
    # Teste 10: Login como vendedor
    print("\n" + "─"*60)
    print("TESTE 10: Login como Vendedor")
    print("─"*60)
    if tester.login("vendedor1", "vende123"):
        tester.get_current_user()
    
    # Teste 11: Tentar criar produto (vendedor - deve falhar)
    print("\n" + "─"*60)
    print("TESTE 11: Tentar criar produto (como vendedor - deve FALHAR)")
    print("─"*60)
    tester.create_product("Livro de Teste Vendedor", 79.90, 1)
    
    # Teste 12: Fazer checkout (vendedor - deve funcionar)
    print("\n" + "─"*60)
    print("TESTE 12: Fazer checkout (como vendedor - deve FUNCIONAR)")
    print("─"*60)
    tester.checkout([{"product_id": 1, "quantity": 1}])
    
    # Teste 13: Registrar cliente (padrão)
    print("\n" + "─"*60)
    print("TESTE 13: Registrar novo cliente (role padrao)")
    print("─"*60)
    # Login como admin primeiro
    tester.login("admin", "admin123")
    tester.register_user("cliente1", "cliente@compia.com", "cliente123")
    
    # Teste 14: Login como cliente
    print("\n" + "─"*60)
    print("TESTE 14: Login como Cliente")
    print("─"*60)
    if tester.login("cliente1", "cliente123"):
        tester.get_current_user()
    
    # Teste 15: Cliente fazer checkout (deve funcionar)
    print("\n" + "─"*60)
    print("TESTE 15: Cliente fazer checkout (deve FUNCIONAR)")
    print("─"*60)
    tester.checkout([{"product_id": 1, "quantity": 1}])
    
    # Teste 16: Cliente tentar criar produto (deve falhar)
    print("\n" + "─"*60)
    print("TESTE 16: Cliente tentar criar produto (deve FALHAR)")
    print("─"*60)
    tester.create_product("Livro de Teste Cliente", 69.90, 1)
    
    print("\n" + "="*60)
    print("TESTES CONCLUIDOS!")
    print("="*60)
    print("\nResumo esperado:")
    print("  Admin: Pode fazer tudo")
    print("  Editor: Pode criar/editar produtos, mas nao deletar ou gerenciar usuarios")
    print("  Vendedor: Pode fazer checkout, mas nao gerenciar produtos")
    print("  Cliente: Pode ver produtos e fazer checkout, mas nao gerenciar conteudo")
    print("\n")

if __name__ == "__main__":
    try:
        run_tests()
    except requests.exceptions.ConnectionError:
        print("\nERRO: Nao foi possivel conectar ao servidor!")
        print("   Certifique-se de que o servidor esta rodando em http://localhost:8000")
        print("   Execute: uvicorn main:app --reload")
    except Exception as e:
        print(f"\nERRO: {e}")
