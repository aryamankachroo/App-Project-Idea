'use client';
import { useEffect, useState } from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { FiMoon, FiSun, FiShare } from 'react-icons/fi';
import { BsFillMoonFill } from 'react-icons/bs';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAllNewsText, setShowAllNewsText] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    }
  }, []);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch articles on dependencies change
  useEffect(() => {
    if (!showFavorites) fetchArticles();
  }, [currentPage, debouncedSearch, sortBy, showFavorites]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 9, sort: sortBy });
      if (debouncedSearch) params.append('search', debouncedSearch);
      const res = await fetch(`http://localhost:8000/news/arxiv?${params}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getArticleKey = (article, idx) => article.link || article.title || String(idx);

  const toggleFavorite = (article, idx) => {
    const key = getArticleKey(article, idx);
    setFavorites((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const shareArticle = async (article) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.summary, url: article.link });
      } else {
        await navigator.clipboard.writeText(article.link);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error', err);
    }
  };

  const displayed = showFavorites ? articles.filter(article => favorites.includes(getArticleKey(article, 0))) : articles;

    return (
    <main className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors`}>      
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl text-blue-600 dark:text-blue-400">🧠</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AInformed
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowFavorites((prev) => !prev)} className="flex items-center text-sm font-medium focus:outline-none">
              {showFavorites ? <AiFillHeart className="w-5 h-5 text-red-500" /> : <AiOutlineHeart className="w-5 h-5 text-red-500" />}
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded focus:outline-none" aria-label="Toggle dark mode">
              {darkMode ? <FiSun className="w-5 h-5 text-yellow-300" /> : <BsFillMoonFill className="w-5 h-5 text-white" />}
                </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-1/3">
                <input
                  type="text"
                  value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
            placeholder="Search articles..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none ${isSearchFocused ? 'ring-2 ring-blue-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
                {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
                  </button>
                )}
              </div>
              <select
                value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="w-full sm:w-1/4 px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none pr-8"
              >
                <option value="date">Latest</option>
                <option value="title">Title</option>
              </select>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
            <p className="mt-4">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold mb-2 dark:text-white">Connection Error</h2>
            <p className="text-sm dark:text-gray-300">{error}</p>
            <button
              onClick={fetchArticles}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >Retry</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
            </svg>
            <h3 className="text-xl font-medium mb-2">No articles found</h3>
            <p className="text-center max-w-sm">Try adjusting your search or filters.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >Clear Search</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.filter(Boolean).map((article, idx) => (
              <article key={getArticleKey(article, idx)} className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:shadow-blue-500/20' : 'bg-white hover:shadow-xl'}`}>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-6 flex flex-col h-full">
                  <h2 className={`font-bold text-xl mb-3 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{article.title}</h2>
                  {article.date && (
                    <p className="text-sm mb-2 flex items-center text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7" />
                      </svg>
                      {new Date(article.date).toLocaleDateString()}
                    </p>
                  )}
                  <p className={`text-sm mb-3 flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {Array.isArray(article.authors) ? article.authors.join(', ') : article.authors}
                  </p>
                  <p className={`text-sm line-clamp-3 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{article.summary}</p>
                  {article.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.categories.slice(0,3).map((cat,i) => (
                        <span key={i} className={`${darkMode ? 'bg-blue-900/40 text-blue-200 border border-blue-800' : 'bg-blue-50 text-blue-600'} px-2 py-1 rounded-full text-xs`}>{cat}</span>
                      ))}
                      {article.categories.length > 3 && <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">+{article.categories.length-3}</span>}
                    </div>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium inline-flex items-center hover:underline text-blue-600 dark:text-blue-400">
                      Read Paper
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m4-8v8m0 0h-8m8-8h-8" />
                      </svg>
                    </a>
                    <button onClick={() => toggleFavorite(article, idx)} className="p-1 rounded-full focus:outline-none">
                      {favorites.includes(getArticleKey(article, idx))
                        ? <AiFillHeart className="w-5 h-5 text-red-500" />
                        : <AiOutlineHeart className="w-5 h-5 text-red-500" />}
            </button>
                    <button onClick={() => shareArticle(article)} className="p-1 rounded-full focus:outline-none">
                      <FiShare className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} w-5 h-5`} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {!showFavorites && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className={`px-3 py-1 rounded border dark:border-gray-600 ${darkMode ? 'text-gray-400' : 'text-gray-700'} ${currentPage===1 ? 'opacity-50 cursor-not-allowed' : ''}`}>First</button>
          <button onClick={() => setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className={`px-3 py-1 rounded border dark:border-gray-600 ${darkMode ? 'text-gray-400' : 'text-gray-700'} ${currentPage===1 ? 'opacity-50 cursor-not-allowed' : ''}`}>Prev</button>
          <span className={`px-4 py-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className={`px-3 py-1 rounded border dark:border-gray-600 ${darkMode ? 'text-gray-400' : 'text-gray-700'} ${currentPage===totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>Next</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className={`px-3 py-1 rounded border dark:border-gray-600 ${darkMode ? 'text-gray-400' : 'text-gray-700'} ${currentPage===totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>Last</button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center py-4 text-sm text-gray-500 dark:text-gray-400 mt-12">
        © 2025 AInformed • Powered by arXiv API
      </footer>
    </main>
  );
}