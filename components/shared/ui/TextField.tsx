// components/shared/ui/TextField.tsx

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextField({ label, className = "", ...rest }: Props) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-medium [color:var(--color-muted)]">{label}</span>
      <input
        className={`h-14 rounded-xl border bg-transparent px-4 text-base [border-color:var(--color-border)] [color:var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)] ${className}`}
        {...rest}
      />
    </label>
  );
}
