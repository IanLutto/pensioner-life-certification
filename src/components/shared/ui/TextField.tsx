import { InputHTMLAttributes, useId } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export function TextField({ label, error, id, className = "", ...rest }: Props) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="flex flex-col gap-2 text-left">
            <label
                htmlFor={inputId}
                className="text-xs font-bold uppercase tracking-wider [color:var(--color-ink)]"
            >
                {label}
            </label>
            <input
                id={inputId}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`h-14 w-full rounded-xl border px-4 text-base font-medium shadow-xs transition-colors
          [background:var(--color-card)] [color:var(--color-ink)] [border-color:var(--color-border)]
          placeholder:[color:var(--color-muted)]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]
          ${error ? "border-red-500 focus-visible:outline-red-500" : ""}
          ${className}`}
                {...rest}
            />
            {error && (
                <p id={errorId} role="alert" className="text-xs font-semibold text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}