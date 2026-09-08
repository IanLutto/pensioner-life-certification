"use client";

import { useId, useRef, ClipboardEvent, KeyboardEvent } from "react";

type Props = {
    label?: string;
    length?: number; // Default: 6
    value: string;
    onChange: (val: string) => void;
    error?: string;
    disabled?: boolean;
};

export function OtpPinInput({
                                label = "Enter 6-Digit Code",
                                length = 6,
                                value = "",
                                onChange,
                                error,
                                disabled = false,
                            }: Props) {
    const generatedId = useId();
    const errorId = `${generatedId}-error`;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const digits = Array.from({ length }, (_, i) => value[i] || "");

    function focusInput(index: number) {
        if (index >= 0 && index < length) {
            inputRefs.current[index]?.focus();
            inputRefs.current[index]?.select();
        }
    }

    function handleChange(digit: string, index: number) {
        const cleanDigit = digit.replace(/\D/g, "").slice(-1);
        const nextValue = value.split("");
        nextValue[index] = cleanDigit;

        const combined = nextValue.join("").slice(0, length);
        onChange(combined);

        if (cleanDigit && index < length - 1) {
            focusInput(index + 1);
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
        if (e.key === "Backspace") {
            if (!digits[index] && index > 0) {
                focusInput(index - 1);
            } else {
                const nextValue = value.split("");
                nextValue[index] = "";
                onChange(nextValue.join(""));
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            focusInput(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            focusInput(index + 1);
        }
    }

    function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pastedData) return;

        onChange(pastedData);
        const focusIdx = Math.min(pastedData.length, length - 1);
        focusInput(focusIdx);
    }

    return (
        <div className="flex flex-col gap-3 text-center">
            {label && (
                <span className="text-xs font-bold uppercase tracking-wider [color:var(--color-ink)]">
                    {label}
                </span>
            )}

            {/* Responsive 6-Digit Box Container */}
            <div className="flex w-full items-center justify-center gap-1.5 xs:gap-2 sm:gap-3">
                {digits.map((digit, idx) => {
                    const isFilled = Boolean(digit);
                    return (
                        <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            disabled={disabled}
                            onChange={(e) => handleChange(e.target.value, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onPaste={handlePaste}
                            aria-label={`Digit ${idx + 1} of ${length}`}
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                            /*
                              Responsive dimensions:
                              - Mobile (<360px): h-12 w-9 text-lg rounded-xl
                              - Small Mobile (360px+): h-14 w-11 text-xl rounded-2xl
                              - Standard (640px+): h-16 w-13 text-2xl
                            */
                            className={`h-12 w-9 xs:h-14 xs:w-11 sm:h-16 sm:w-13 shrink-0 rounded-xl xs:rounded-2xl border-2 text-center text-lg xs:text-xl sm:text-2xl font-extrabold transition-all duration-150
                                [background:var(--color-card)] [color:var(--color-ink)]
                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                                ${
                                error
                                    ? "border-red-500/80 bg-red-500/5 focus-visible:[outline-color:theme(colors.red.500)]"
                                    : isFilled
                                        ? "[border-color:var(--color-accent)] shadow-xs"
                                        : "[border-color:var(--color-border)] focus-visible:[outline-color:var(--color-focus)] hover:[border-color:var(--color-muted)]"
                            }
                                disabled:opacity-50
                            `}
                        />
                    );
                })}
            </div>

            {/* Error Badge */}
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