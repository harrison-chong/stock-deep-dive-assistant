import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMarketMovers } from '../services/api';
import { MarketMovers } from '../components/MarketMovers';
import { MarketMoversData } from '../types/analysis';

export default function MarketMoversPage() {
  const navigate = useNavigate();
  const [marketMovers, setMarketMovers] = useState<MarketMoversData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarketMovers = async () => {
      try {
        const movers = await fetchMarketMovers();
        console.log('Fetched movers:', movers);
        setMarketMovers(movers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch market movers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load market movers');
      } finally {
        setLoading(false);
      }
    };

    loadMarketMovers();
  }, []);

  const handleStockClick = (ticker: string) => {
    navigate(`/?ticker=${ticker}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Market Movers</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading market movers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : marketMovers &&
          (marketMovers.top_performers.length > 0 || marketMovers.bottom_performers.length > 0) ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <MarketMovers
              topPerformers={marketMovers.top_performers}
              bottomPerformers={marketMovers.bottom_performers}
              onStockClick={handleStockClick}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No market data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
