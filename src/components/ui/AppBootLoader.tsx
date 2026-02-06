import { Loader } from "./Loader";

export function AppBootLoader({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm dark:bg-black/40">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
        <Loader text="Server qoşulur… (ilk dəfə gec ola bilər)" />
      </div>
    </div>
  );
}
