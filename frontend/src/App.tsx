import { AutocompleteInput } from './components/AutocompleteInput';
import { TrendingUp } from 'lucide-react';
import { useStockAnalysis, UseStockAnalysisReturn } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import { PerformanceCalculatorPage } from './pages/PerformanceCalculatorPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { useState } from 'react';
import './App.css';
import { PERIODS, getDateRange } from './constants';
import { ErrorAlert } from './components/shared/ErrorAlert';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

type Tab = 'analysis' | 'performance' | 'watchlist';

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
    <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5 overflow-x-auto hide-scrollbar flex-nowrap">
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

function AnalysisTab(
  props: Pick<
    UseStockAnalysisReturn,
    | 'ticker'
    | 'setTicker'
    | 'period'
    | 'setPeriod'
    | 'loading'
    | 'loadingAI'
    | 'error'
    | 'errorAI'
    | 'data'
    | 'handleAnalyze'
    | 'updateChartData'
    | 'handleGenerateAI'
  >,
) {
  const {
    ticker,
    setTicker,
    period,
    setPeriod,
    loading,
    loadingAI,
    error,
    errorAI,
    data,
    handleAnalyze,
    updateChartData,
    handleGenerateAI,
  } = props;
  // Get date range for the selected period
  const dateRange = getDateRange(period);

  // Handle period change from chart - lightweight chart-only update (no metrics recalculation)
  const handleChartPeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (ticker.trim()) {
      const newDateRange = getDateRange(newPeriod);
      updateChartData(newDateRange);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Search Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <AutocompleteInput
              value={ticker}
              onChange={setTicker}
              onSubmit={() => handleAnalyze(undefined, dateRange)}
              placeholder="Enter ticker (e.g., AAPL, CBA.AX for ASX, NVDA for NASDAQ)"
              disabled={loading}
              submitLabel={loading ? 'Analyzing...' : 'Analyze'}
              showSubmitButton={true}
            />
          </div>
          <PeriodSelector value={period} onChange={setPeriod} disabled={loading} />
        </div>
        <p className="text-xs text-gray-400">
          Stock data provided by{' '}
          <a
            href="https://au.finance.yahoo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Yahoo Finance
          </a>
        </p>
        {import.meta.env.VITE_API_BASE_URL &&
          !import.meta.env.VITE_API_BASE_URL.includes('localhost') && (
            <p className="text-xs text-gray-400 mt-1">
              Note: Initial load may take ~60s if service was inactive.
            </p>
          )}
        {error && <ErrorAlert message={error} />}
      </div>

      {/* Analysis Results */}
      {data && (
        <AnalysisResults
          data={data}
          period={period}
          onPeriodChange={handleChartPeriodChange}
          loadingAI={loadingAI}
          errorAI={errorAI}
          onGenerateAI={handleGenerateAI}
        />
      )}
    </div>
  );
}

function TabNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="border-b border-gray-100 bg-white sticky top-[57px] z-40">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => onTabChange('analysis')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => onTabChange('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'performance'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Performance Calculator
            </button>
            <button
              onClick={() => onTabChange('watchlist')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'watchlist'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const {
    ticker,
    setTicker,
    period,
    setPeriod,
    loading,
    loadingAI,
    error,
    errorAI,
    data,
    handleAnalyze,
    updateChartData,
    handleGenerateAI,
  } = useStockAnalysis();

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

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content - Only active tab mounts (lazy loading) */}
      <ErrorBoundary>
        {activeTab === 'analysis' && (
          <AnalysisTab
            ticker={ticker}
            setTicker={setTicker}
            period={period}
            setPeriod={setPeriod}
            loading={loading}
            loadingAI={loadingAI}
            error={error}
            errorAI={errorAI}
            data={data}
            handleAnalyze={handleAnalyze}
            updateChartData={updateChartData}
            handleGenerateAI={handleGenerateAI}
          />
        )}
        {activeTab === 'performance' && <PerformanceCalculatorPage />}
        {activeTab === 'watchlist' && <WatchlistPage />}
      </ErrorBoundary>
    </div>
  );
}

export default App;
