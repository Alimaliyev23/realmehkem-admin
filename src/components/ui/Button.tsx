import type React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 " +
  "disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-white/10";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",
  secondary:
    "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost:
    "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10",
};

export function Button({
  variant = "secondary",
  loading = false,
  leftIcon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {loading ? "Gözləyin..." : children}
    </button>
  );
}
