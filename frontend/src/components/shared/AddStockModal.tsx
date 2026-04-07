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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Stock to Watchlist</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Ticker</label>
              <AutocompleteInput
                value={formData.ticker}
                onChange={(ticker) => onFormChange({ ...formData, ticker })}
                onSubmit={() => {}}
                placeholder="Stock ticker (e.g. AAPL, BHP.AX)"
                showSubmitButton={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Date <span className="text-gray-400 text-xs">(defaults to today)</span>
              </label>
              <DatePickerInput
                value={formData.entry_date || ''}
                onChange={(date) => onFormChange({ ...formData, entry_date: date })}
                placeholder="Select date"
                minDate={new Date(2000, 0, 1)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Price{' '}
                <span className="text-gray-400 text-xs">
                  (leave empty to use closing price on date)
                </span>
              </label>
              <input
                type="number"
                placeholder="Price on entry date"
                value={formData.entry_price || ''}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    entry_price: parseFloat(e.target.value) || undefined,
                  })
                }
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                placeholder="Reason for interest..."
                value={formData.notes}
                onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Added By</label>
              <input
                type="text"
                placeholder="Your name (required)"
                value={formData.added_by}
                onChange={(e) => onFormChange({ ...formData, added_by: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
