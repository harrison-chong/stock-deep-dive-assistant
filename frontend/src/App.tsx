import { BrowserRouter as Router, Routes, Route, Link, useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import PerformanceCalculatorPage from './pages/PerformanceCalculatorPage';
import MarketMoversPage from './pages/MarketMoversPage';
import './App.css';

function HomePage() {
  const { ticker, setTicker, loading, error, data, handleAnalyze } = useStockAnalysis();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tickerParam = searchParams.get('ticker');
    if (tickerParam) {
      setTicker(tickerParam);
      // Trigger analysis after setting ticker
      setTimeout(() => {
        const event = new SubmitEvent('submit', { bubbles: true });
        handleAnalyze(event as any);
      }, 0);
    }
  }, [searchParams, setTicker, handleAnalyze]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">Stock Deep Dive</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Analysis
            </Link>
            <Link
              to="/market-movers"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Market Movers
            </Link>
            <Link
              to="/performance"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Performance Calculator
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <form onSubmit={handleAnalyze} className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter stock ticker (e.g., AAPL, BHP.AX)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {data && <AnalysisResults data={data} />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/market-movers" element={<MarketMoversPage />} />
        <Route path="/performance" element={<PerformanceCalculatorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
