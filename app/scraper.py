import requests
from bs4 import BeautifulSoup

# Example: Scrape news from Arxiv RSS
def fetch_arxiv_news():
    url = "https://export.arxiv.org/rss/cs.AI"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "xml")

    articles = []
    for item in soup.find_all("item")[:10]:  # Get top 10 articles
        title = item.title.text
        link = item.link.text
        summary = item.description.text
        articles.append({"title": title, "link": link, "summary": summary})

    return articles

# Example: Extract full content from a news article
def fetch_full_article(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Try to find the main content
    content = soup.find('article') or soup.find('main') or soup.find('div', class_='content')
    if content:
        text = content.get_text(separator='\n', strip=True)
    else:
        text = soup.get_text(separator='\n', strip=True)
    
    title = soup.title.string if soup.title else "No title found"
    
    return {"title": title, "content": text}
