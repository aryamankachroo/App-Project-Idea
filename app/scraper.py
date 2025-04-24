import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z").strftime("%B %d, %Y")
    except:
        return None

# Example: Scrape news from Arxiv RSS
def fetch_arxiv_news():
    try:
        url = "https://export.arxiv.org/rss/cs.AI"
        logger.info(f"Fetching RSS feed from {url}")
        
        response = requests.get(url)
        response.raise_for_status()
        
        # Try different parsers in order of preference
        for parser in ['lxml', 'xml', 'html.parser']:
            try:
                logger.info(f"Attempting to parse with {parser}")
                soup = BeautifulSoup(response.content, parser)
                items = soup.find_all("item")
                
                if items:
                    logger.info(f"Successfully found {len(items)} items with {parser} parser")
                    break
            except Exception as e:
                logger.error(f"Parser {parser} failed: {str(e)}")
                continue
        else:
            raise ValueError("All parsers failed to find items")

        articles = []
        for item in items[:10]:
            try:
                # Extract all available metadata
                title = item.find('title')
                link = item.find('link')
                description = item.find('description')
                pub_date = item.find('pubDate')
                creator = item.find('dc:creator') or item.find('creator')
                categories = [cat.text for cat in item.find_all('category')] if item.find('category') else []
                
                # Clean and format the data
                article = {
                    "title": title.text.strip() if title else "No title",
                    "link": link.text.strip() if link else "#",
                    "summary": description.text.strip() if description else "No summary available",
                    "date": parse_date(pub_date.text) if pub_date else None,
                    "authors": creator.text.strip() if creator else "Unknown Authors",
                    "categories": categories,
                    "arxiv_id": link.text.strip().split('/')[-1] if link else None
                }
                
                articles.append(article)
                logger.info(f"Successfully processed article: {article['title']}")
                
            except Exception as e:
                logger.error(f"Error processing individual item: {str(e)}")
                continue
        
        if not articles:
            raise ValueError("Failed to parse any articles")
            
        logger.info(f"Successfully fetched {len(articles)} articles")
        return articles
        
    except requests.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to fetch from arXiv: {str(e)}")
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing arXiv feed: {str(e)}")

# Example: Extract full content from a news article
def fetch_full_article(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Try to find the main content
        content = soup.find('article') or soup.find('main') or soup.find('div', class_='content')
        if content:
            text = content.get_text(separator='\n', strip=True)
        else:
            text = soup.get_text(separator='\n', strip=True)
        
        title = soup.title.string if soup.title else "No title found"
        
        return {"title": title, "content": text}
        
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch article: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing article: {str(e)}")
