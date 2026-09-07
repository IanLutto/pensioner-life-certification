// components/shared/ui/SecondaryButton.tsx

import { ButtonHTMLAttributes } from "react";

export function SecondaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-12 w-full items-center justify-center rounded-full border text-base font-medium transition-colors disabled:opacity-50 [border-color:var(--color-border)] [color:var(--color-ink)] hover:enabled:[background:var(--color-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
