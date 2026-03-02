import { Search, AlertCircle, TrendingUp } from 'lucide-react';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import './App.css';

function App() {
  const { ticker, setTicker, loading, error, data, handleAnalyze } = useStockAnalysis();

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

        {/* Results */}
        {data && <AnalysisResults data={data} />}
      </div>
    </div>
  );
}

export default App;
