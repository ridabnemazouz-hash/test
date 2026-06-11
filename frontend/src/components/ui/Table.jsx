import React from 'react';
import { cn } from '../../utils';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className={cn('w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('bg-[var(--surface-tertiary)]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--surface-secondary)] transition-colors duration-100', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th className={cn('px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]', className)} {...props}>
      {children}
    </th>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-[var(--border-light)]', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('px-5 py-3.5 text-sm text-[var(--text-secondary)] whitespace-nowrap', className)} {...props}>
      {children}
    </td>
  );
}
