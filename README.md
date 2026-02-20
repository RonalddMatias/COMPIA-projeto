# COMPIA Editora - E-commerce Platform

## Sobre o Projeto
Plataforma de e-commerce desenvolvida para a editora COMPIA, focado na venda de materiais bibliográficos de Inteligência Artificial.

## Stack Tecnológica
- **Backend:** FastAPI (Python)
- **Frontend:** React + TypeScript (Vite)
- **Banco de Dados:** PostgreSQL
- **Infraestrutura:** Docker & Docker Compose

## Estrutura do Projeto
- `/backend`: API e lógica de negócios.
- `/frontend`: Interface do usuário.
- `docker-compose.yml`: Orquestração de containers.

## Como Iniciar (Ambiente de Desenvolvimento)

### 1. Configuração do Ambiente
Antes de iniciar, é necessário configurar as variáveis de ambiente:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis:

**SECRET_KEY (OBRIGATÓRIO):**
Gere uma chave secreta segura para autenticação JWT:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copie a chave gerada e substitua o valor de `SECRET_KEY` no arquivo `.env`.

**DATABASE_URL:**
Por padrão, está configurado para o PostgreSQL via Docker. Se necessário, ajuste as credenciais.

### 2. Banco de Dados
O projeto utiliza PostgreSQL via Docker.
```bash
docker-compose up -d
```

### 3. Criar Usuário Administrador
Após configurar o banco de dados, crie o primeiro usuário administrador:
```bash
cd backend
python create_admin.py
```
Este script criará um usuário com as seguintes credenciais padrão:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@compia.com.br

⚠️ **IMPORTANTE:** Altere a senha do administrador após o primeiro login!

### 4. Backend (FastAPI)
Abra um terminal dedicado para o backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
A API estará disponível em `http://localhost:8000`.
Documentação automática (Swagger): `http://localhost:8000/docs`.

### 5. Frontend (React)
Abra um novo terminal para o frontend:
```bash
cd frontend
npm install
npm run dev
```
O frontend estará acessível em `http://localhost:5173`.
