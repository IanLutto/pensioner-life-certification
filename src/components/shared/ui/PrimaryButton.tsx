import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = "", children, disabled, ...rest }: Props) {
    return (
        <button
            disabled={disabled}
            className={`flex h-14 w-full items-center justify-center rounded-full px-6 text-base font-semibold shadow-md transition-all
        [font-family:var(--font-display)]
        [background:var(--color-accent)] [color:var(--color-accent-ink)]
        hover:[background:var(--color-accent-hover)]
        active:scale-[0.99]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--color-focus)]
        ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}