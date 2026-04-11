import { X } from 'lucide-react';
import { AutocompleteInput } from '../AutocompleteInput';
import { DatePickerInput } from '../DatePickerInput';
import { ErrorAlert } from './ErrorAlert';

interface FormData {
  ticker: string;
  entry_date?: string;
  entry_price?: number;
  notes?: string;
  added_by: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: () => void;
  error?: string;
}

export function AddStockModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  error,
}: AddStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-200/30 dark:border-gray-800/30 shadow-elevated">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Add to Watchlist
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Track a stock you&apos;re monitoring
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Stock Ticker
              </label>
              <AutocompleteInput
                value={formData.ticker}
                onChange={(ticker) => onFormChange({ ...formData, ticker })}
                onSubmit={() => {}}
                placeholder="e.g. AAPL, BHP.AX"
                showSubmitButton={false}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Entry Date{' '}
                <span className="text-gray-400 dark:text-gray-500 normal-case">
                  (defaults to today)
                </span>
              </label>
              <DatePickerInput
                value={formData.entry_date || ''}
                onChange={(date) => onFormChange({ ...formData, entry_date: date })}
                placeholder="Select date"
                minDate={new Date(2000, 0, 1)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Entry Price{' '}
                <span className="text-gray-400 dark:text-gray-500 normal-case">(optional)</span>
              </label>
              <input
                type="number"
                placeholder="Leave empty to use closing price"
                value={formData.entry_price || ''}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    entry_price: parseFloat(e.target.value) || undefined,
                  })
                }
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Notes
              </label>
              <textarea
                placeholder="Why are you interested in this stock?"
                value={formData.notes}
                onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Required"
                value={formData.added_by}
                onChange={(e) => onFormChange({ ...formData, added_by: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorAlert message={error} />
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-200/30 dark:border-gray-700/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
