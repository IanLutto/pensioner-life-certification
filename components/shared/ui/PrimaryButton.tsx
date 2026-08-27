// components/shared/ui/PrimaryButton.tsx

import { ButtonHTMLAttributes } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-14 w-full items-center justify-center rounded-full text-base font-semibold transition-colors disabled:opacity-50 [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:enabled:[background:var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
