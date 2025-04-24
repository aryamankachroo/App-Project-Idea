'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch articles when page, search, or sort changes
  useEffect(() => {
    fetchArticles();
  }, [currentPage, debouncedSearch, sortBy]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(`http://127.0.0.1:8000/news/arxiv?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticles(data.articles);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shareArticle = async (article) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.link
        });
      } else {
        await navigator.clipboard.writeText(article.link);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (error) {
    return (
      <main className={`min-h-screen p-4 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          🧠 AI & Data Science News Hub
        </h1>
        <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
          Error loading articles: {error}
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🧠 AI & Data Science News Hub
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? '🌞' : '🌙'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="">Sort by...</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, idx) => (
                <article key={idx} className={`rounded-xl shadow-lg p-6 transition-shadow duration-300 ${darkMode ? 'bg-gray-800 hover:shadow-blue-500/20' : 'bg-white hover:shadow-xl'}`}>
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h2 className={`font-bold text-xl mb-3 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {article.title}
                      </h2>
                      
                      {article.date && (
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          📅 {article.date}
                        </p>
                      )}
                      
                      {article.authors && (
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ✍️ {article.authors}
                        </p>
                      )}

                      <p className={`text-sm line-clamp-3 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {article.summary}
                      </p>

                      {article.categories && article.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.categories.map((category, i) => (
                            <span key={i} className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'}`}>
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
                        >
                          Read Paper
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                        <button
                          onClick={() => shareArticle(article)}
                          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title="Share"
                        >
                          📤
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                Previous
              </button>
              <span className={`mx-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
