interface DeleteConfirmModalProps {
  isOpen: boolean;
  ticker: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  ticker,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-gray-200/30 dark:border-gray-800/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Stock</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span> from your
          watchlist?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200/30 dark:border-gray-700/30"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
