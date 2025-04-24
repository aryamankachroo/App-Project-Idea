from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="AI & Data Science News Aggregator")

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Welcome to the AI News Aggregator!"}
