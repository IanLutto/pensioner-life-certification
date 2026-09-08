"use client";

// components/self-service/OtpVerifyForm.tsx

import { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { TextField } from "@/components/shared/ui/TextField";
import {OtpPinInput} from "@/components/shared/ui/OtpPinInput";

type Props = {
    nationalId: string;
    maskedPhone: string;
    onVerified: () => void;
};

export function OtpVerifyForm({ nationalId, maskedPhone, onVerified }: Props) {
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(60);
    const [resendStatus, setResendStatus] = useState<string | null>(null);

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Sanitize input to numbers only and cap at 6 digits
    function handleOtpChange(value: string) {
        const numeric = value.replace(/\D/g, "").slice(0, 6);
        setOtp(numeric);
    }

    async function handleResendCode() {
        if (resendTimer > 0) return;

        setResendStatus("Sending new code…");
        setError(null);

        try {
            if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
                await new Promise((r) => setTimeout(r, 400));
            } else {
                await fetch("/api/self-service/resend-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nationalId }),
                });
            }
            setResendStatus("A new code has been sent!");
            setResendTimer(60);
        } catch {
            setError("Failed to resend code. Please try again.");
            setResendStatus(null);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (otp.length < 6) {
            setError("Please enter the complete 6-digit code.");
            return;
        }

        setSubmitting(true);
        setError(null);

        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 500));
            if (otp.trim() !== "123456") {
                setError("That code didn't match. Check your SMS messages and try again.");
                setSubmitting(false);
                return;
            }
            onVerified();
            return;
        }

        try {
            const res = await fetch("/api/self-service/verify-otp", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nationalId, otp }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const body = await res.json();
            if (!body.verified) {
                setError("That code didn't match. Check your SMS messages and try again.");
                setSubmitting(false);
                return;
            }
            onVerified();
        } catch {
            setError("Unable to verify code. Please check your connection and try again.");
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
            <div>
                <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                    Enter SMS code
                </h1>
                <p className="mt-2 text-sm leading-relaxed [color:var(--color-muted)]">
                    We sent a 6-digit verification code to <br />
                    <span className="font-semibold [color:var(--color-ink)]">{maskedPhone}</span>
                </p>
            </div>

            <div className="text-center">
                <OtpPinInput
                    label="6-Digit Verification Code"
                    value={otp}
                    onChange={handleOtpChange}
                    error={error || undefined}
                />

                {/* Dev Mode Helper */}
                {process.env.NEXT_PUBLIC_USE_MOCKS === "true" && (
                    <p className="mt-3 text-xs text-amber-600 font-medium">
                        💡 Demo Mode: Use code <code className="font-bold">123456</code>
                    </p>
                )}
            </div>

            <PrimaryButton
                type="submit"
                disabled={submitting || otp.length < 6}
            >
                {submitting ? "Verifying code…" : "Verify and continue →"}
            </PrimaryButton>

            {/* Resend SMS Section */}
            <div className="flex flex-col items-center gap-1">
                <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0}
                    className="text-xs font-semibold underline underline-offset-4 [color:var(--color-ink)] disabled:opacity-50 disabled:no-underline"
                >
                    {resendTimer > 0
                        ? `Resend code in ${resendTimer}s`
                        : "Didn't receive a code? Tap to resend"}
                </button>
                {resendStatus && (
                    <p className="text-xs text-emerald-600 font-medium">{resendStatus}</p>
                )}
            </div>

            {/*{error && (*/}
            {/*    <p role="alert" aria-live="assertive" className="text-sm font-medium [color:var(--color-accent-hover)]">*/}
            {/*        {error}*/}
            {/*    </p>*/}
            {/*)}*/}
        </form>
    );
}