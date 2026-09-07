// components/shared/ui/TextField.tsx

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export function TextField({ label, error, className = "", ...rest }: Props) {
    return (
        <label className="flex flex-col gap-2 text-left [font-family:var(--font-display)]">
            <span className="text-base font-bold [color:var(--color-ink)]">{label}</span>
            <input
                aria-invalid={!!error}
                className={`h-16 rounded-2xl border-2 bg-[var(--color-surface-raised)] px-5 text-lg
          [border-color:var(--color-border)] [color:var(--color-ink)]
          placeholder:[color:var(--color-muted)]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]
          ${error ? "[border-color:var(--color-error)]" : ""}
          ${className}`}
                {...rest}
            />
            {error && (
                <span role="alert" className="text-sm [color:var(--color-error)]">
          {error}
        </span>
            )}
        </label>
    );
}
