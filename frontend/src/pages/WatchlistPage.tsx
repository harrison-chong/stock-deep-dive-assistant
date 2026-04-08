import { useState, useMemo } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { RefreshCw, X } from 'lucide-react';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { AddStockModal } from '../components/shared/AddStockModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { TableSkeleton, CardSkeleton } from '../components/shared/SkeletonLoader';
import { getGainLossColor } from '../utils/formatting';

export function WatchlistPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOption, setFilterOption] = useState<string>('');
  const [addError, setAddError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; ticker: string } | null>(null);
  const [formData, setFormData] = useState({
    ticker: '',
    entry_price: undefined as number | undefined,
    entry_date: '',
    notes: '',
    added_by: '',
  });

  const {
    watchlist,
    isLoading,
    isRefetching,
    error,
    refetch,
    addStock,
    deleteStock,
    addError: mutationAddError,
  } = useWatchlist(true);

  // Compute displayed stocks by filtering client-side
  const displayedStocks = useMemo(
    () => (filterOption ? watchlist.filter((s) => s.added_by === filterOption) : watchlist),
    [watchlist, filterOption],
  );

  // Derive filter options from loaded watchlist entries
  const filterOptions = useMemo(
    () => Array.from(new Set(watchlist.map((s) => s.added_by).filter(Boolean))).sort(),
    [watchlist],
  );

  const handleAddStock = () => {
    if (!formData.ticker || !formData.added_by.trim()) {
      setAddError('Ticker and name are required');
      return;
    }

    addStock({
      ticker: formData.ticker,
      entry_price: formData.entry_price,
      entry_date: formData.entry_date || undefined,
      notes: formData.notes,
      added_by: formData.added_by,
    });

    setAddModalOpen(false);
    setFormData({ ticker: '', entry_price: undefined, entry_date: '', notes: '', added_by: '' });
    setAddError('');
  };

  const handleDeleteStock = (id: string) => {
    deleteStock(id);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (error && watchlist.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Watchlist</h2>
          <p className="text-sm text-gray-500 mt-1">Track stocks you&apos;re considering buying</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {displayedStocks.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Total Stocks</p>
            <p className="text-2xl font-bold text-gray-900">{displayedStocks.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Avg Gain/Loss</p>
            {(() => {
              const total = displayedStocks.reduce((sum, s) => sum + s.gain_loss_percentage, 0);
              const avg = total / displayedStocks.length;
              return (
                <p className={`text-2xl font-bold ${getGainLossColor(avg)}`}>
                  {formatPercentage(avg)}
                </p>
              );
            })()}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Above Entry</p>
            <p className="text-2xl font-bold text-green-600">
              {displayedStocks.filter((s) => s.gain_loss_percentage >= 0).length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Below Entry</p>
            <p className="text-2xl font-bold text-red-600">
              {displayedStocks.filter((s) => s.gain_loss_percentage < 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      {filterOptions.length > 1 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterOption('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterOption === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterOption(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterOption === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Watchlist Table */}
      {isLoading ? (
        <>
          <CardSkeleton />
          <TableSkeleton rows={5} />
        </>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">Your watchlist is empty</p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add your first stock
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Current Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Gain/Loss
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedStocks.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{entry.ticker}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.added_by}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    {entry.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    ${entry.entry_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    ${entry.current_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-medium ${getGainLossColor(entry.gain_loss_percentage)}`}
                    >
                      {formatPercentage(entry.gain_loss_percentage)}
                    </span>
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
        onFormChange={
          setFormData as (data: {
            ticker: string;
            entry_price?: number;
            entry_date?: string;
            notes?: string;
            added_by: string;
          }) => void
        }
        onSubmit={handleAddStock}
        error={addError || mutationAddError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        ticker={deleteConfirm?.ticker || ''}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteStock(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
