"use client";

import { forwardRef } from "react";
import Spinner from "./Spinner";

export type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";
export type ButtonSize = "lg" | "md" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-green text-white hover:bg-brand-green-dark disabled:opacity-70",
  danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-70",
  secondary: "border border-border bg-panel text-heading hover:bg-surface disabled:opacity-60",
  ghost: "border border-border text-heading/70 hover:bg-border disabled:opacity-60",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "rounded-full px-8 py-2.5 text-sm font-semibold gap-2 shadow-card",
  md: "rounded-lg px-4 py-2 text-sm font-semibold gap-1.5",
  sm: "rounded-lg px-3 py-1 text-xs font-semibold gap-1.5",
};

const spinnerSizeClasses: Record<ButtonSize, string> = {
  lg: "h-4 w-4",
  md: "h-4 w-4",
  sm: "h-3.5 w-3.5",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  // Shown in place of the loading spinner when not loading — e.g. a leading
  // Plus/Trash2/Search icon that gets swapped for the spinner mid-action.
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "lg",
    loading = false,
    icon,
    disabled,
    className = "",
    children,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner className={spinnerSizeClasses[size]} /> : icon}
      {children}
    </button>
  );
});

export default Button;
