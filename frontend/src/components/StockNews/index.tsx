import { useEffect, useState } from 'react';
import { getStockNews, NewsArticle } from '../../services/api';

interface StockNewsProps {
  ticker: string;
}

const INITIAL_COUNT = 6;

export function StockNews({ ticker }: StockNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!ticker) return;

      try {
        const data = await getStockNews(ticker);
        setArticles(data.articles);
      } catch (err) {
        console.error('Failed to fetch stock news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Latest News</h3>
        <p className="text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Latest News</h3>
        <p className="text-xs text-gray-500">No news available</p>
      </div>
    );
  }

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const displayedArticles = showAll ? articles : articles.slice(0, INITIAL_COUNT);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Latest News</h3>
      <div className="grid grid-cols-2 gap-3">
        {displayedArticles.map((article, index) => (
          <a
            key={index}
            href={article.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {article.thumbnail && (
              <div className="mb-2">
                <img
                  src={article.thumbnail}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <h4 className="text-xs font-medium text-gray-900 group-hover:text-blue-600 line-clamp-3 leading-snug">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {article.provider && (
                <span className="text-xs text-gray-500 truncate max-w-[100px]">
                  {article.provider}
                </span>
              )}
              {article.pub_date && (
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(article.pub_date)}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
      {articles.length > INITIAL_COUNT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAll ? 'Show less' : `Show ${articles.length - INITIAL_COUNT} more`}
        </button>
      )}
    </div>
  );
}
