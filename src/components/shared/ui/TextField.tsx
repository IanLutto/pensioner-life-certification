import { InputHTMLAttributes, useId } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    hint?: string;
};

export function TextField({
                              label,
                              error,
                              hint,
                              id,
                              className = "",
                              ...rest
                          }: Props) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Construct aria-describedby based on available messages
    const ariaDescribedBy = [
        error ? errorId : null,
        hint ? hintId : null,
    ].filter(Boolean).join(" ") || undefined;

    return (
        <div className="flex flex-col gap-2.5 text-center">
            {/* Label Header */}
            <label
                htmlFor={inputId}
                className="text-xs font-bold uppercase tracking-wider [color:var(--color-ink)]"
            >
                {label}
            </label>

            {/* Centered Modern Input */}
            <div className="relative w-full">
                <input
                    id={inputId}
                    aria-invalid={!!error}
                    aria-describedby={ariaDescribedBy}
                    className={`h-16 w-full rounded-2xl border-2 text-center text-xl font-bold tracking-widest transition-all duration-200
                        [background:var(--color-card)] [color:var(--color-ink)]
                        placeholder:text-center placeholder:font-normal placeholder:tracking-normal placeholder:[color:var(--color-muted)]
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                        ${
                        error
                            ? "border-red-500/80 bg-red-500/5 focus-visible:[outline-color:theme(colors.red.500)]"
                            : "[border-color:var(--color-border)] focus-visible:[outline-color:var(--color-focus)] hover:[border-color:var(--color-muted)]"
                    }
                        ${className}`}
                    {...rest}
                />
            </div>

            {/* Optional Hint Text */}
            {hint && !error && (
                <p id={hintId} className="text-xs font-medium [color:var(--color-muted)]">
                    {hint}
                </p>
            )}

            {/* Modernized Floating Error Badge */}
            {error && (
                <div
                    id={errorId}
                    role="alert"
                    className="inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-500 border border-red-500/20"
                >
                    <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}