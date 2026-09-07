// components/shared/ui/PrimaryButton.tsx
// NOTE: rebuilt from usage only — I haven't seen the original source.
// Reconcile any props/behavior this is missing against the real file.

import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = "", children, ...rest }: Props) {
  return (
      <button
          className={`h-16 rounded-2xl px-6 text-lg font-bold transition-colors
        [font-family:var(--font-display)]
        [background-color:var(--color-accent)] [color:var(--color-surface)]
        hover:[background-color:var(--color-accent-hover)]
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]
        ${className}`}
          {...rest}
      >
        {children}
      </button>
  );
}
