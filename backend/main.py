from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import products, categories

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="COMPIA Editora API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(categories.router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API da COMPIA Editora!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
