import { AutocompleteInput } from './components/AutocompleteInput';
import { TrendingUp, Sun, Moon } from 'lucide-react';
import { useStockAnalysis, UseStockAnalysisReturn } from './hooks/useStockAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import { PerformanceCalculatorPage } from './pages/PerformanceCalculatorPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { useState, useEffect } from 'react';
import { Skeleton } from './components/shared/SkeletonLoader';
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
    <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-full gap-0.5 overflow-x-auto hide-scrollbar flex-nowrap transition-colors duration-300">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            period.value === value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-card'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
    handleGenerateAI,
  } = props;
  // Get date range for the selected period
  const dateRange = getDateRange(period);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Search Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <AutocompleteInput
              value={ticker}
              onChange={setTicker}
              onSubmit={() => handleAnalyze(undefined, dateRange)}
              placeholder="Enter ticker (e.g., AAPL, CBA.AX, HSBA.L)"
              disabled={loading}
              submitLabel={loading ? 'Analyzing...' : 'Analyze'}
              showSubmitButton={true}
            />
          </div>
          <PeriodSelector value={period} onChange={setPeriod} disabled={loading} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Stock data provided by{' '}
          <a
            href="https://au.finance.yahoo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Yahoo Finance
          </a>
        </p>
        {import.meta.env.VITE_API_BASE_URL &&
          !import.meta.env.VITE_API_BASE_URL.includes('localhost') && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Note: Initial load may take ~60s if service was inactive.
            </p>
          )}
        {error && <ErrorAlert message={error} />}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-5">
          {/* Company header skeleton */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-10 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          {/* Chart skeleton */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          {/* Metrics skeleton */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {data && !loading && (
        <AnalysisResults
          data={data}
          period={period}
          loadingAI={loadingAI}
          errorAI={errorAI}
          onGenerateAI={handleGenerateAI}
        />
      )}

      {/* Empty state - no data, not loading, no error */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Enter a ticker to begin
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Search for any publicly traded company using its stock ticker symbol.
          </p>
        </div>
      )}
    </div>
  );
}

function TabNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-[57px] z-40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            <button
              onClick={() => onTabChange('analysis')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'analysis'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => onTabChange('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'performance'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Performance Calculator
            </button>
            <button
              onClick={() => onTabChange('watchlist')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'watchlist'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
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

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
      )}
    </button>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing state from media query is a standard pattern
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Stock Deep Dive
              </h1>
            </div>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content - Only active tab mounts (lazy loading) */}
      <main id="main-content">
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
      </main>
    </div>
  );
}

export default App;
