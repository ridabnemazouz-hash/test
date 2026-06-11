import React from 'react';
import { cn } from '../../utils';

const variants = {
  primary: 'bg-[var(--accent)] text-white hover:brightness-110 shadow-sm',
  secondary: 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border)]',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]',
  outline: 'bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-brand-50 dark:hover:bg-brand-950/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-[15px]',
  xl: 'px-6 py-3 text-base',
};

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]',
        'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        'cursor-pointer select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
