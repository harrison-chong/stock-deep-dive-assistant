import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AutocompleteInput } from './components/AutocompleteInput';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import PerformanceCalculatorPage from './pages/PerformanceCalculatorPage';
import PortfolioPage from './pages/PortfolioPage';
import './App.css';

// Period options with date calculation
const PERIODS = [
  { value: '1mo', label: '1M', months: 1 },
  { value: '3mo', label: '3M', months: 3 },
  { value: '6mo', label: '6M', months: 6 },
  { value: '1y', label: '1Y', years: 1 },
  { value: '2y', label: '2Y', years: 2 },
  { value: '5y', label: '5Y', years: 5 },
  { value: '10y', label: '10Y', years: 10 },
  { value: 'ytd', label: 'YTD', ytd: true },
  { value: 'max', label: 'Max', max: true },
];

// Calculate start and end dates from period selection
function getDateRange(
  periodValue: string,
): { startDate: string; endDate: string } | { period: string } {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const period = PERIODS.find((p) => p.value === periodValue);
  if (!period) return { period: '5y' };

  if (period.max) return { period: 'max' };
  if (period.ytd) {
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    return { startDate: startOfYear, endDate };
  }
  if (period.months) {
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - period.months);
    return { startDate: startDate.toISOString().split('T')[0], endDate };
  }
  if (period.years) {
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - period.years);
    return { startDate: startDate.toISOString().split('T')[0], endDate };
  }

  return { period: '5y' };
}

function PeriodSelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          disabled={disabled}
          className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
            period.value === value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

function HomePage() {
  const { ticker, setTicker, period, setPeriod, loading, error, data, handleAnalyze } =
    useStockAnalysis();

  // Get date range for the selected period
  const dateRange = getDateRange(period);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">Stock Deep Dive</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-100 bg-white sticky top-[57px] z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Analysis
            </Link>
            <Link
              to="/performance"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Performance Calculator
            </Link>
            <Link
              to="/portfolio"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                onSubmit={() => handleAnalyze(undefined, dateRange)}
                placeholder="Enter stock ticker (e.g., AAPL, BHP.AX)"
                disabled={loading}
                submitLabel={loading ? 'Analyzing...' : 'Analyze'}
                showSubmitButton={true}
              />
            </div>
            <PeriodSelector value={period} onChange={setPeriod} disabled={loading} />
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
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
