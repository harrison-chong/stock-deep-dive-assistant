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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Watchlist
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track stocks you&apos;re considering
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {displayedStocks.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Stocks
            </p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
              {displayedStocks.length}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Avg Gain/Loss
            </p>
            {(() => {
              const total = displayedStocks.reduce((sum, s) => sum + s.gain_loss_percentage, 0);
              const avg = total / displayedStocks.length;
              return (
                <p className={`text-3xl font-semibold mt-1 ${getGainLossColor(avg)}`}>
                  {formatPercentage(avg)}
                </p>
              );
            })()}
          </div>
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Above Entry
            </p>
            <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {displayedStocks.filter((s) => s.gain_loss_percentage >= 0).length}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Below Entry
            </p>
            <p className="text-3xl font-semibold text-red-500 dark:text-red-400 mt-1">
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
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              filterOption === ''
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-card'
                : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/60 border border-gray-200/30 dark:border-gray-700/30'
            }`}
          >
            All
          </button>
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterOption(filter)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                filterOption === filter
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-card'
                  : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/60 border border-gray-200/30 dark:border-gray-700/30'
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
        <div className="text-center py-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-800/30 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
            <svg
              className="w-8 h-8 text-blue-500 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            Start tracking stocks you&apos;re interested in to monitor their performance over time.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Add your first stock
          </button>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden animate-fade-in transition-all duration-300">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/30 dark:border-gray-800/30 bg-gray-50/30 dark:bg-gray-800/30">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Added By
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notes
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Entry
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Current
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Gain/Loss
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
              {displayedStocks.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-colors"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.ticker}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {entry.added_by}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                    {entry.notes || '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono tabular-nums">
                    ${entry.entry_price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-mono tabular-nums">
                    ${entry.current_price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-sm font-semibold font-mono tabular-nums ${getGainLossColor(entry.gain_loss_percentage)}`}
                    >
                      {formatPercentage(entry.gain_loss_percentage)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setDeleteConfirm({ id: entry.id, ticker: entry.ticker })}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
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
