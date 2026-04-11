import React, { useState } from 'react';
import axios from 'axios';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { DatePickerInput } from '../components/DatePickerInput';
import { API_BASE_URL } from '../constants';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { WarningAlert } from '../components/shared/WarningAlert';

interface PerformanceData {
  ticker: string;
  company_name: string;
  purchase_date: string;
  current_date: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  total_cost: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  annualized_return: number | null;
  annualized_return_percentage: number | null;
  disclaimer: string;
  timestamp: string;
}

export function PerformanceCalculatorPage() {
  const [ticker, setTicker] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PerformanceData | null>(null);
  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker.trim() || !purchaseDate.trim() || !quantity.trim() || !purchasePrice.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/performance`, {
        ticker: ticker.toUpperCase(),
        purchase_date: purchaseDate,
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchasePrice),
      });
      setData(response.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to calculate performance. Check inputs and try again.',
      );
    } finally {
      setLoading(false);
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
    }).format(value);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Calculator Section */}
      <div className="mb-12">
        <form onSubmit={handleCalculate}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Stock Ticker */}
            <AutocompleteInput
              value={ticker}
              onChange={setTicker}
              onSubmit={handleCalculate}
              placeholder="Enter stock ticker (e.g., AAPL, BHP.AX)"
              disabled={loading}
              submitLabel=""
              showSubmitButton={false}
            />

            {/* Purchase Date */}
            <DatePickerInput
              value={purchaseDate}
              onChange={setPurchaseDate}
              placeholder="Purchase Date"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Quantity */}
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Purchase Price */}
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Purchase Price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Performance'}
          </button>
        </form>
        {error && <ErrorAlert message={error} />}
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-8">
          {/* Company Header */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.company_name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.ticker}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.current_price)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Performance Summary
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {purchaseDate} → {data.current_date}
              </span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Total Investment
                </h4>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {formatCurrency(data.total_cost)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {data.quantity} shares @ {formatCurrency(data.purchase_price)}
                </p>
              </div>

              <div className="bg-green-50/60 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-6">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">
                  Current Value
                </h4>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {formatCurrency(data.current_value)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {data.quantity} shares @ {formatCurrency(data.current_price)}
                </p>
              </div>

              <div className="bg-purple-50/60 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-6">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">
                  Profit/Loss
                </h4>
                <p
                  className={`text-2xl font-bold ${data.profit_loss >= 0 ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'}`}
                >
                  {data.profit_loss >= 0 ? '↑' : '↓'} {formatCurrency(data.profit_loss)}
                </p>
                <p
                  className={`text-sm ${data.profit_loss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {formatPercentage(data.profit_loss_percentage / 100)}
                </p>
              </div>

              <div className="bg-orange-50/60 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/30 rounded-xl p-6">
                <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-3">
                  Annualized Return
                </h4>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                  {data.annualized_return_percentage !== null
                    ? formatPercentage(data.annualized_return_percentage / 100)
                    : 'N/A'}
                </p>
                {data.annualized_return_percentage === null ? (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Only calculated for holdings owned 6+ months
                  </p>
                ) : (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Compounded annually
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Investment Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Purchase Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.purchase_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Current Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {data.current_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Days Held:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(
                      (new Date(data.current_date).getTime() -
                        new Date(data.purchase_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Purchase Price:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(data.purchase_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Current Price:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(data.current_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Price Change:</span>
                  <span
                    className={`font-medium ${data.current_price >= data.purchase_price ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {data.current_price >= data.purchase_price ? '↑' : '↓'}{' '}
                    {formatCurrency(data.current_price - data.purchase_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <WarningAlert message={data.disclaimer} />

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Performance calculated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
