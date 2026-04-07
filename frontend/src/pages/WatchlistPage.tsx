import { useState, useEffect } from 'react';
import { WatchlistEntry, AddWatchlistRequest } from '../types/watchlist';
import { addWatchlistEntry, deleteWatchlistEntry, getWatchlist } from '../services/watchlist';
import { RefreshCw, X } from 'lucide-react';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { AddStockModal } from '../components/shared/AddStockModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { getGainLossColor } from '../utils/formatting';

export function WatchlistPage() {
  const [allStocks, setAllStocks] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPrices, setHasPrices] = useState(false);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOption, setFilterOption] = useState<string>('');
  const [addError, setAddError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; ticker: string } | null>(null);
  const [formData, setFormData] = useState<AddWatchlistRequest>({
    ticker: '',
    entry_price: undefined,
    entry_date: '',
    notes: '',
    added_by: '',
  });

  // Compute displayed stocks by filtering client-side
  const displayedStocks = filterOption
    ? allStocks.filter((s) => s.added_by === filterOption)
    : allStocks;

  // Derive filter options from loaded watchlist entries
  const filterOptions = Array.from(
    new Set(allStocks.map((s) => s.added_by).filter(Boolean)),
  ).sort();

  // Load watchlist on mount (without fetching live prices)
  useEffect(() => {
    loadWatchlist(false);
  }, []);

  const loadWatchlist = async (fetchCurrentPrice: boolean = true) => {
    try {
      setLoading(true);
      if (fetchCurrentPrice) setRefreshing(true);
      setError('');
      const data = await getWatchlist(undefined, fetchCurrentPrice);
      setAllStocks(data.watchlist);
      if (fetchCurrentPrice) setHasPrices(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddStock = async () => {
    try {
      await addWatchlistEntry(formData);
      setAddModalOpen(false);
      setFormData({ ticker: '', entry_price: undefined, entry_date: '', notes: '', added_by: '' });
      setAddError('');
      // Refresh with prices if we already have prices, otherwise without
      await loadWatchlist(hasPrices);
    } catch (err: unknown) {
      // Extract meaningful error message from axios error response
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosError?.response?.data?.detail ||
        (err instanceof Error
          ? err.message
          : 'Failed to add stock. Check the ticker and try again.');
      setAddError(message);
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      await deleteWatchlistEntry(id);
      // Refresh with prices if we already have prices, otherwise without
      await loadWatchlist(hasPrices);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock');
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
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading watchlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <ErrorAlert message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Watchlist</h1>
          <p className="text-sm text-gray-500 mt-1">Track stocks you&apos;re considering buying</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadWatchlist(true);
            }}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Filter */}
      {filterOptions.length > 0 && (
        <div className="mb-6">
          <select
            value={filterOption}
            onChange={(e) => {
              setFilterOption(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          >
            <option value="">All</option>
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      {displayedStocks.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">
            No stocks in your watchlist yet. Add your first stock to get started!
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedStocks.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{entry.ticker}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{entry.entry_date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatCurrency(entry.entry_price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {hasPrices ? formatCurrency(entry.current_price) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasPrices ? (
                      <span
                        className={`text-sm font-medium ${getGainLossColor(entry.gain_loss_percentage)}`}
                      >
                        {formatPercentage(entry.gain_loss_percentage)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 truncate max-w-xs block">
                      {entry.notes || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{entry.added_by || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: entry.id, ticker: entry.ticker })}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {displayedStocks.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-gray-500 uppercase">Showing</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayedStocks.length} of {allStocks.length}
              </p>
            </div>
            {hasPrices && displayedStocks.length > 0 && (
              <>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Avg Gain/Loss</p>
                  {(() => {
                    const total = displayedStocks.reduce(
                      (sum, s) => sum + s.gain_loss_percentage,
                      0,
                    );
                    const avg = total / displayedStocks.length;
                    return (
                      <p className={`text-lg font-semibold ${getGainLossColor(avg)}`}>
                        {formatPercentage(avg)}
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Above Entry</p>
                  <p className="text-lg font-semibold text-green-600">
                    {displayedStocks.filter((s) => s.gain_loss_percentage >= 0).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Below Entry</p>
                  <p className="text-lg font-semibold text-red-600">
                    {displayedStocks.filter((s) => s.gain_loss_percentage < 0).length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setFormData({
            ticker: '',
            entry_price: undefined,
            entry_date: '',
            notes: '',
            added_by: '',
          });
          setAddError('');
        }}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleAddStock}
        error={addError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        ticker={deleteConfirm?.ticker || ''}
        onConfirm={async () => {
          if (deleteConfirm) {
            await handleDeleteStock(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
