import React, { useState } from 'react'
import axios from 'axios'
import { Search, AlertCircle, TrendingUp, Calculator } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface PerformanceData {
  ticker: string
  company_name: string
  purchase_date: string
  current_date: string
  quantity: number
  purchase_price: number
  current_price: number
  total_cost: number
  current_value: number
  profit_loss: number
  profit_loss_percentage: number
  annualized_return: number
  annualized_return_percentage: number
  disclaimer: string
  timestamp: string
}

function PerformanceCalculatorPage() {
  const [ticker, setTicker] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<PerformanceData | null>(null)
  const [apiUrl] = useState('http://localhost:8000')
  const navigate = useNavigate()
  const location = useLocation()

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim() || !purchaseDate.trim() || !quantity.trim() || !purchasePrice.trim()) return

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await axios.post(`${apiUrl}/api/performance`, {
        ticker: ticker.toUpperCase(),
        purchase_date: purchaseDate,
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchasePrice)
      })
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate performance. Check inputs and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">
              Performance Calculator
            </h1>
            <button
              onClick={handleBack}
              className="ml-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Back to Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Calculator Section */}
        <div className="mb-12">
          <form onSubmit={handleCalculate} className="relative">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Stock Ticker */}
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
              
              {/* Purchase Date */}
              <div className="flex-1 relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Quantity */}
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Purchase Price */}
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="Purchase Price"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Performance'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-8">
            {/* Company Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{data.company_name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{data.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-gray-900">{formatCurrency(data.current_price)}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                Performance Summary
                <span className="text-sm font-normal text-gray-600">
                  {purchaseDate} → {data.current_date}
                </span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Total Investment</h4>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.total_cost)}</p>
                  <p className="text-sm text-blue-600">{data.quantity} shares @ {formatCurrency(data.purchase_price)}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">Current Value</h4>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(data.current_value)}</p>
                  <p className="text-sm text-green-600">{data.quantity} shares @ {formatCurrency(data.current_price)}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">Profit/Loss</h4>
                  <p className={`text-2xl font-bold ${data.profit_loss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {data.profit_loss >= 0 ? '↑' : '↓'} {formatCurrency(data.profit_loss)}
                  </p>
                  <p className={`text-sm ${data.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(data.profit_loss_percentage)}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="font-semibold text-orange-900 mb-3">Annualized Return</h4>
                  <p className="text-2xl font-bold text-orange-900">{formatPercentage(data.annualized_return_percentage)}</p>
                  <p className="text-sm text-orange-600">Compounded annually</p>
                </div>
              </div>
            </div>

            {/* Investment Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Investment Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Purchase Date:</span>
                    <span className="font-medium text-gray-900">{data.purchase_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Current Date:</span>
                    <span className="font-medium text-gray-900">{data.current_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Days Held:</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((new Date(data.current_date).getTime() - new Date(data.purchase_date).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Purchase Price:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(data.purchase_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Current Price:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(data.current_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Price Change:</span>
                    <span className={`font-medium ${data.current_price >= data.purchase_price ? 'text-green-900' : 'text-red-900'}`}>
                      {data.current_price >= data.purchase_price ? '↑' : '↓'} {formatCurrency(data.current_price - data.purchase_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex gap-4">
              <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-800 text-sm leading-relaxed">
                {data.disclaimer}
              </p>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Performance calculated: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceCalculatorPage