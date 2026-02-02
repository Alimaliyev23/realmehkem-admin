

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title = "Təsdiq",
  description = "Bu əməliyyatı etmək istədiyinizə əminsiniz?",
  confirmText = "Bəli, təsdiqlə",
  cancelText = "Ləğv et",
  loading = false,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {title}
          </h3>
        </div>

        <div className="px-4 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border border-gray-200 px-4 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 rounded-lg px-4 text-sm text-white disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {loading ? "Gözləyin..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
