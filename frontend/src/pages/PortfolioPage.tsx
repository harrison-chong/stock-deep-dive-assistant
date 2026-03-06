import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PortfolioEntry, PortfolioSummary, PortfolioPerformance, AddPortfolioRequest, SellPortfolioRequest } from '../types/portfolio';
import { addPortfolioEntry, sellPortfolioEntry, getPortfolio, getPortfolioPerformance, getPortfolioSummary } from '../services/portfolio';
import { Search, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PortfolioEntry | null>(null);
  const [formData, setFormData] = useState<AddPortfolioRequest>({
    ticker: '',
    purchase_date: '',
    quantity: 0,
    purchase_price: 0
  });
  const [sellFormData, setSellFormData] = useState<{
    id: string;
    sell_date: string;
    sell_price: number;
  }>({
    id: '',
    sell_date: '',
    sell_price: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
  
        const [portfolioData, summaryData, performanceData] = await Promise.all([
          getPortfolio(),
          getPortfolioSummary(),
          getPortfolioPerformance()
        ]);
  
        console.log('Performance Data:', performanceData);
        
        setPortfolio(portfolioData.portfolio);
        setSummary(summaryData);
        setPerformance(performanceData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

  const handleAddStock = async () => {
    try {
      await addPortfolioEntry(formData);
      setAddModalOpen(false);
      setFormData({
        ticker: '',
        purchase_date: '',
        quantity: 0,
        purchase_price: 0
      });
      await loadPortfolio();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add stock to portfolio');
    }
  };

  const handleSellStock = async () => {
    try {
      await sellPortfolioEntry(sellFormData);
      setSellModalOpen(false);
      setSellFormData({
        id: '',
        sell_date: '',
        sell_price: 0
      });
      await loadPortfolio();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sell stock');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Back to Analysis
            </Link>
            <button
              onClick={() => setAddModalOpen(true)}
              className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Stock
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Summary Section */}
        {/* Performance Section */}
        {performance && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Performance</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Total Cost Basis</h3>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(performance.total_cost)}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Current Value</h3>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(performance.current_value)}
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-900 mb-2">Total P&L</h3>
                  <p className={`text-2xl font-bold ${
                    performance.total_profit_loss >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {performance.total_profit_loss >= 0 ? '↑' : '↓'} {formatCurrency(performance.total_profit_loss)}
                  </p>
                  <p className={`text-sm ${
                    performance.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(performance.total_profit_loss_percentage)}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-900 mb-2">Annualized Return</h3>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatPercentage(performance.annualized_return_percentage)}
                  </p>
                </div>
              </div>

              {performance.benchmark_comparison && Object.keys(performance.benchmark_comparison).length > 0 && (
                              <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Comparison</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  {Object.entries(performance.benchmark_comparison).map(([name, returnPercentage]) => {
                                    const benchmarkValue = performance.benchmark_monetary_comparison?.[name] || 0;
                                    const valueChange = benchmarkValue - performance.total_cost;
                                    const valueChangeFormatted = formatCurrency(valueChange);
                                    const valueChangeClass = valueChange >= 0 ? 'text-green-600' : 'text-red-600';
                                    
                                    // Calculate earliest purchase date from portfolio
                                    let earliestPurchaseDate: string | null = null;
                                    if (portfolio.length > 0) {
                                      const dates = portfolio.map(entry => new Date(entry.purchase_date));
                                      const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
                                      earliestPurchaseDate = sortedDates[0]?.toISOString().split('T')[0] || null;
                                    }
                                    
                                    return (
                                      <div key={name} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                          <div>
                                            <p className="font-medium text-gray-900">{name}</p>
                                            <p className="text-xs text-gray-600">Benchmark</p>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {formatPercentage(returnPercentage)}
                                          </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <p className="text-xs text-gray-500">Value if invested in benchmark:</p>
                                          <p className={`text-sm font-medium ${valueChange >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                            {formatCurrency(benchmarkValue)}
                                          </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                          <p className="text-xs text-gray-500">Difference from portfolio:</p>
                                          <p className={`text-sm font-medium ${valueChangeClass}`}>
                                            {valueChange >= 0 ? '↑' : '↓'} {valueChangeFormatted}
                                          </p>
                                        </div>
                                        {earliestPurchaseDate && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">Based on earliest purchase: {earliestPurchaseDate}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
            </div>
          </div>
        )}

        {/* Holdings Section */}
        <div className="mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Holdings</h2>
            
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No stocks in your portfolio yet. Add your first stock to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {portfolio.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{entry.company_name}</h3>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{entry.ticker}</span>
                        </div>
                        <p className="text-sm text-gray-600">Purchased {entry.quantity} shares at {formatCurrency(entry.purchase_price)} each</p>
                        <p className="text-sm text-gray-600 mt-1">Purchase Date: {entry.purchase_date}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {formatCurrency(entry.current_value || entry.purchase_price * entry.quantity)} {/* Show current value or fallback */}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatCurrency(entry.current_price || entry.purchase_price)} per share
                        </div>
                        <div className={`text-sm font-medium ${
                          entry.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.profit_loss >= 0 ? '↑' : '↓'} {formatCurrency(entry.profit_loss || 0)} ({formatPercentage(entry.profit_loss_percentage || 0)})
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Annualized Return: {formatPercentage(entry.annualized_return_percentage || 0)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSellModalOpen(true);
                          setSelectedEntry(entry);
                          setSellFormData({
                            id: entry.id,
                            sell_date: new Date().toISOString().split('T')[0],
                            sell_price: entry.current_price || entry.purchase_price
                          });
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Stock to Portfolio</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddStock();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Ticker</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="AAPL, BHP.AX"
                      value={formData.ticker}
                      onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="Number of shares"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    placeholder="Price per share"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setFormData({
                      ticker: '',
                      purchase_date: '',
                      quantity: 0,
                      purchase_price: 0
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.ticker || !formData.purchase_date || formData.quantity <= 0 || formData.purchase_price <= 0}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Stock Modal */}
      {sellModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sell {selectedEntry.company_name}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSellStock();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sell Date</label>
                  <input
                    type="date"
                    value={sellFormData.sell_date}
                    onChange={(e) => setSellFormData({...sellFormData, sell_date: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price</label>
                  <input
                    type="number"
                    placeholder="Current market price"
                    value={sellFormData.sell_price}
                    onChange={(e) => setSellFormData({...sellFormData, sell_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSellModalOpen(false);
                    setSelectedEntry(null);
                    setSellFormData({
                      id: '',
                      sell_date: '',
                      sell_price: 0
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sellFormData.sell_date || sellFormData.sell_price <= 0}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sell Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;