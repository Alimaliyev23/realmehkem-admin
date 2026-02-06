export function Loader({ text = "Yüklənir…" }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent dark:border-white/20 dark:border-t-transparent" />
      <span>{text}</span>
    </div>
  );
}
