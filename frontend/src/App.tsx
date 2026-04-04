import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AutocompleteInput } from './components/AutocompleteInput';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import PerformanceCalculatorPage from './pages/PerformanceCalculatorPage';
import PortfolioPage from './pages/PortfolioPage';
import './App.css';

const PERIODS = [
  { value: '1mo', label: '1 Month' },
  { value: '3mo', label: '3 Months' },
  { value: '6mo', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: '2y', label: '2 Years' },
  { value: '5y', label: '5 Years' },
  { value: '10y', label: '10 Years' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'max', label: 'Max' },
];

function HomePage() {
  const { ticker, setTicker, period, setPeriod, loading, error, data, handleAnalyze } =
    useStockAnalysis();

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
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <AutocompleteInput
                value={ticker}
                onChange={setTicker}
                onSubmit={handleAnalyze}
                placeholder="Enter stock ticker (e.g., AAPL, BHP.AX)"
                disabled={loading}
                submitLabel={loading ? 'Analyzing...' : 'Analyze'}
                showSubmitButton={true}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="period-select" className="text-sm text-gray-600 whitespace-nowrap">
                Data Period:
              </label>
              <select
                id="period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
