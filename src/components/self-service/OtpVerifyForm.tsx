"use client";

// components/self-service/OtpVerifyForm.tsx
//
// On success, the server has already set the httpOnly session cookie —
// this component just needs to tell the parent flow to move on.

import { useState } from "react";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { TextField } from "@/components/shared/ui/TextField";

type Props = {
    nationalId: string;
    maskedPhone: string;
    onVerified: () => void;
};

export function OtpVerifyForm({ nationalId, maskedPhone, onVerified }: Props) {
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // TODO(remove once FastAPI /self-service/verify-otp is live): mocked.
        // Dev code is fixed at 123456 so the wrong-code error path is still
        // testable, rather than every entry silently succeeding.
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 400));
            if (otp.trim() !== "123456") {
                setError("That code didn't match. Check your messages and try again.");
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
            const body = await res.json();
            if (!body.verified) {
                setError("That code didn't match. Check your messages and try again.");
                setSubmitting(false);
                return;
            }
            onVerified();
        } catch {
            setError("Something went wrong. Please try again.");
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
            <div>
                <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                    Enter your code
                </h1>
                <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
                    We sent a code to the number ending {maskedPhone}.
                </p>
            </div>

            <TextField
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
            />

            <PrimaryButton type="submit" disabled={submitting || otp.trim().length === 0}>
                {submitting ? "Verifying…" : "Verify"}
            </PrimaryButton>

            {error && (
                <p role="alert" className="text-sm [color:var(--color-accent-hover)]">
                    {error}
                </p>
            )}
        </form>
    );
}
