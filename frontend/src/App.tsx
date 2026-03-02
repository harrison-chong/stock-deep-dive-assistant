import React, { useState } from 'react'
import axios from 'axios'
import { Search, AlertCircle, TrendingUp, BarChart3, Calendar, DollarSign, TrendingUp as TrendingUpIcon } from 'lucide-react'
import './App.css'

interface AnalysisData {
  ticker: string
  company_name: string
  sector: string | null
  industry: string | null
  current_price: number
  market_cap: number | null
  snapshot_summary: string
  technical_overview: {
    moving_averages: { name: string; value: number | null }[]
    momentum: { name: string; value: number | null }[]
    volatility: { name: string; value: number | null }[] | undefined
  }
  fundamental_overview: {
    profitability: { name: string; value: number | null; interpretation: string | null }[]
    valuation: { name: string; value: number | null; interpretation: string | null }[]
    financial_strength: { name: string; value: number | null; interpretation: string | null }[]
    growth: { name: string; value: number | null; interpretation: string | null }[]
  }
  ai_outlook: {
    overall_summary: string
    bull_case: string
    bear_case: string
    risk_factors: string[]
    neutral_scenario: string
    recommendation: string
    recommendation_rationale: string
    confidence_score: number
  }
  timestamp: string
}

interface PerformanceData {
  ticker: string
  company_name: string
  purchase_date: string
  quantity: number
  purchase_price: number
  current_price: number
  total_cost: number
  current_value: number
  profit_loss: number
  profit_loss_percentage: number
  holding_period: number
  annualized_return: number | null
  disclaimer: string
  timestamp: string
}

function App() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<AnalysisData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [apiUrl] = useState('http://localhost:8000')

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim()) return

    setLoading(true)
    setError('')
    setPerformanceData(null)

    try {
      const response = await axios.post(`${apiUrl}/api/analyze`, {
        ticker: ticker.toUpperCase(),
      })
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze stock. Check the ticker and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculatePerformance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim()) return

    setLoading(true)
    setError('')

    try {
      const purchaseDate = (e.target as HTMLFormElement).purchase_date.value
      const quantity = parseFloat((e.target as HTMLFormElement).quantity.value)
      const purchasePrice = parseFloat((e.target as HTMLFormElement).purchase_price.value) || undefined

      const response = await axios.post(`${apiUrl}/api/performance`, {
        ticker: ticker.toUpperCase(),
        purchase_date: purchaseDate,
        quantity: quantity,
        purchase_price: purchasePrice,
      })
      setPerformanceData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate performance. Check inputs and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUpIcon className="w-6 h-6 text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">
              Stock Deep Dive
            </h1>
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

        {/* Performance Calculator */}
        {data && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Calculate Performance
            </h3>
            <form onSubmit={handleCalculatePerformance} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    step="0.01"
                    min="0"
                    placeholder="sugma"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
              >
                {loading ? 'Calculating...' : 'Calculate Performance'}
              </button>
            </form>
          </div>
        )}

        {/* Results */}
        {data && <AnalysisResults data={data} />}
        {performanceData && <PerformanceResults data={performanceData} />}
      </div>
    </div>
  )
}

function AnalysisResults({ data }: { data: AnalysisData }) {
  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{data.company_name}</h2>
            <p className="text-sm text-gray-600 mt-1">{data.ticker}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">${data.current_price.toFixed(2)}</p>
            {data.market_cap && (
              <p className="text-sm text-gray-600 mt-1">
                Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B
              </p>
            )}
          </div>
        </div>
        {data.sector && <p className="text-gray-700">{data.sector} • {data.industry}</p>}
      </div>

      {/* Snapshot Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshot</h3>
        <p className="text-gray-700 leading-relaxed">{data.snapshot_summary}</p>
      </div>

      {/* Technical Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricsCard title="Moving Averages" metrics={data.technical_overview.moving_averages} />
        <MetricsCard title="Momentum" metrics={data.technical_overview.momentum} />
        <MetricsCard title="Volatility" metrics={data.technical_overview.volatility || []} />
      </div>

      {/* Fundamental Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricsCard 
          title="Profitability" 
          metrics={data.fundamental_overview.profitability}
          showInterpretation={true}
        />
        <MetricsCard 
          title="Valuation" 
          metrics={data.fundamental_overview.valuation}
          showInterpretation={true}
        />
        <MetricsCard 
          title="Financial Strength" 
          metrics={data.fundamental_overview.financial_strength}
          showInterpretation={true}
        />
        <MetricsCard 
          title="Growth" 
          metrics={data.fundamental_overview.growth}
          showInterpretation={true}
        />
      </div>

      {/* AI Outlook */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          AI Analysis
          <span className="text-sm font-normal text-gray-600">
            Confidence: {data.ai_outlook.confidence_score.toFixed(0)}%
          </span>
        </h3>

        <div className="space-y-6">
          <div>
            <p className="text-gray-700 leading-relaxed">{data.ai_outlook.overall_summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h4 className="font-semibold text-gray-900 mb-3">Bull Case</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{data.ai_outlook.bull_case}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-red-50">
              <h4 className="font-semibold text-gray-900 mb-3">Bear Case</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{data.ai_outlook.bear_case}</p>
            </div>
          </div>

          {data.ai_outlook.risk_factors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
              <ul className="space-y-2">
                {data.ai_outlook.risk_factors.map((risk, i) => (
                  <li key={i} className="text-gray-700 text-sm flex gap-3">
                    <span className="text-gray-400">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
            <h4 className="font-semibold text-gray-900 mb-3">Neutral Scenario</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{data.ai_outlook.neutral_scenario}</p>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Recommendation</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{data.ai_outlook.recommendation}</p>
              <p className="text-gray-700 text-sm mt-3 leading-relaxed">{data.ai_outlook.recommendation_rationale}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-800 text-sm leading-relaxed">
          This is not financial advice. This tool is for educational purposes only. Always conduct your own research and consult with qualified financial advisors before making investment decisions.
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Analysis generated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  )
}

function PerformanceResults({ data }: { data: PerformanceData }) {
  const profitClass = data.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
  const profitIcon = data.profit_loss >= 0 ? 'arrow-up' : 'arrow-down'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Performance Results
      </h3>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Investment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Date:</span>
              <span className="font-medium">{data.purchase_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{data.quantity} shares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Price:</span>
              <span className="font-medium">${data.purchase_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Price:</span>
              <span className="font-medium">${data.current_price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-medium">${data.total_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-medium">${data.current_value.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit/Loss:</span>
              <span className={`font-medium ${profitClass}`}>
                {data.profit_loss >= 0 ? '+' : ''}${data.profit_loss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Return:</span>
              <span className={`font-medium ${profitClass}`}>
                {data.profit_loss_percentage >= 0 ? '+' : ''}{data.profit_loss_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Holding Period</h4>
          <p className="text-2xl font-bold text-gray-900">{data.holding_period} days</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Annualized Return</h4>
          <p className="text-2xl font-bold text-purple-900">
            {data.annualized_return !== null ? `${data.annualized_return.toFixed(2)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">Current Value</h4>
          <p className="text-2xl font-bold text-orange-900">${data.current_value.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-800 text-sm leading-relaxed">
          {data.disclaimer}
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Performance calculated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  )
}

interface MetricsCardProps {
  title: string
  metrics: { name: string; value: number | null; interpretation?: string | null }[]
  showInterpretation?: boolean
}

function MetricsCard({ title, metrics, showInterpretation }: MetricsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="text-gray-700 text-sm">{metric.name}</span>
              <span className="font-medium text-gray-900">
                {metric.value !== null ? metric.value.toFixed(2) : 'N/A'}
              </span>
            </div>
            {showInterpretation && metric.interpretation && (
              <p className="text-xs text-gray-600">{metric.interpretation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
