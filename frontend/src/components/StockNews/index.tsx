import { useEffect, useState } from 'react';
import { getStockNews, NewsArticle } from '../../services/api';

interface StockNewsProps {
  ticker: string;
}

const INITIAL_COUNT = 4;

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
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Latest News</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-100/60 dark:bg-gray-800/40"
            >
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Latest News</h3>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/30 rounded-full">
            Y! Finance
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No news available for {ticker}
        </p>
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
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Latest News</h3>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/30 rounded-full">
            Y! Finance
          </span>
        </div>
        {articles.length > INITIAL_COUNT && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {showAll ? 'Show less' : `Show all (${articles.length})`}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {displayedArticles.map((article, index) => (
          <a
            key={index}
            href={article.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors"
          >
            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt=""
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {article.provider && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {article.provider}
                  </span>
                )}
                {article.pub_date && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {formatRelativeTime(article.pub_date)}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
