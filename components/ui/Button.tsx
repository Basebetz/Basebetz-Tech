"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "green" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-[35px] transition-all duration-150 tracking-wide uppercase text-sm select-none disabled:opacity-40 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary:   "bg-bb-blue text-white hover:bg-bb-blue-2 active:scale-[0.98] shadow-glow-sm",
      secondary: "bg-bb-navy text-bb-text-2 border border-bb-border hover:border-bb-blue hover:text-bb-text",
      ghost:     "text-bb-text-2 hover:text-bb-text hover:bg-bb-navy",
      danger:    "bg-bb-red/10 text-bb-red border border-bb-red/25 hover:bg-bb-red/20",
      green:     "bg-bb-green/10 text-bb-green border border-bb-green/25 hover:bg-bb-green/20 shadow-glow-green",
      outline:   "border border-bb-blue text-bb-blue hover:bg-bb-blue hover:text-white",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5",
      lg: "px-8 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
