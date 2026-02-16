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

### 1. Banco de Dados
O projeto utiliza PostgreSQL via Docker.
```bash
docker-compose up -d
```

### 2. Backend (FastAPI)
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

### 3. Frontend (React)
Abra um novo terminal para o frontend:
```bash
cd frontend
npm install
npm run dev
```
O frontend estará acessível em `http://localhost:5173`.
