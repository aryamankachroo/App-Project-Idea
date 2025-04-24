from fastapi import APIRouter
from app.scraper import fetch_arxiv_news, fetch_full_article

router = APIRouter()

@router.get("/news/arxiv")
def get_arxiv_news():
    return fetch_arxiv_news()

@router.get("/news/article")
def get_article(url: str):
    return fetch_full_article(url)
