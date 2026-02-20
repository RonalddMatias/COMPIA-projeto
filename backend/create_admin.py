"""
Script para criar o primeiro usuário administrador do sistema.
Execute este script após iniciar o banco de dados.

Uso:
    python create_admin.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, UserRole
from auth import get_password_hash

def create_admin_user():
    """Cria o primeiro usuário administrador"""
    
    # Cria as tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verifica se já existe um admin
        admin_exists = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        if admin_exists:
            print("Já existe um usuário administrador no sistema!")
            print(f"   Username: {admin_exists.username}")
            print(f"   Email: {admin_exists.email}")
            return
        
        # Dados do admin padrão
        admin_username = "admin"
        admin_email = "admin@compia.com.br"
        admin_password = "admin123"
        
        # Cria o usuário admin
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("Usuário administrador criado com sucesso!")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Senha: {admin_password}")
        print("\nIMPORTANTE: Mude esta senha após o primeiro login!")
        
    except Exception as e:
        print(f"Erro ao criar usuário administrador: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
