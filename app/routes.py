from fastapi import APIRouter, HTTPException, Query
from app.scraper import fetch_arxiv_news, fetch_full_article
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/news/arxiv")
async def get_arxiv_news(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    sort: Optional[str] = Query(None, enum=["date", "title"]),
    search: Optional[str] = None
):
    try:
        logger.info(f"Handling request to /news/arxiv with page={page}, limit={limit}, sort={sort}, search={search}")
        articles = fetch_arxiv_news()
        
        # Apply search filter if provided
        if search:
            search = search.lower()
            articles = [
                article for article in articles
                if search in article["title"].lower() or 
                   search in article["summary"].lower() or
                   search in article["authors"].lower()
            ]
        
        # Apply sorting
        if sort == "date":
            articles.sort(key=lambda x: x["date"] if x["date"] else "", reverse=True)
        elif sort == "title":
            articles.sort(key=lambda x: x["title"])
            
        # Calculate pagination
        total = len(articles)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        articles = articles[start_idx:end_idx]
        
        return {
            "articles": articles,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error in get_arxiv_news: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/article")
async def get_article(url: str):
    try:
        return fetch_full_article(url)
    except Exception as e:
        logger.error(f"Error in get_article: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
