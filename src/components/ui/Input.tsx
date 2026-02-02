import type React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  const inputCls =
    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 " +
    "border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 " +
    "dark:[color-scheme:dark] dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-white/10";

  const errorCls = error ? "border-red-500 focus:ring-red-200" : "";

  const body = (
    <>
      <input {...props} className={`${inputCls} ${errorCls} ${className}`} />
      {error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : helperText ? (
        <div className="text-xs text-gray-500 dark:text-slate-400">
          {helperText}
        </div>
      ) : null}
    </>
  );

  if (!label) return body;

  return (
    <label className="grid gap-1">
      <span className="text-xs text-gray-600 dark:text-slate-400">{label}</span>
      {body}
    </label>
  );
}
