import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AutocompleteInput } from './components/AutocompleteInput';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import PerformanceCalculatorPage from './pages/PerformanceCalculatorPage';
import PortfolioPage from './pages/PortfolioPage';
import './App.css';

function HomePage() {
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
              to="/performance"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Performance Calculator
            </Link>
            <Link
              to="/portfolio"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <AutocompleteInput
            value={ticker}
            onChange={setTicker}
            onSubmit={handleAnalyze}
            placeholder="Enter stock ticker (e.g., AAPL, BHP.AX)"
            disabled={loading}
            submitLabel={loading ? 'Analyzing...' : 'Analyze'}
            showSubmitButton={true}
          />
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
        <Route path="/performance" element={<PerformanceCalculatorPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Routes>
    </Router>
  );
}

export default App;
