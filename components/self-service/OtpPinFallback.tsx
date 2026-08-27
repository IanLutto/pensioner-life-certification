"use client";

// components/self-service/OtpPinFallback.tsx
//
// The graceful-degradation path: no platform authenticator, no enrolled
// device, or the pensioner opted out. Produces the same FingerprintSignal
// shape so the caller doesn't need to branch on which path ran.

import { useState } from "react";
import type { FingerprintSignal } from "@/lib/webauthn/types";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { SecondaryButton } from "@/components/shared/ui/SecondaryButton";
import { TextField } from "@/components/shared/ui/TextField";

type Props = {
    onComplete: (signal: FingerprintSignal | null) => void;
};

export function OtpPinFallback({ onComplete }: Props) {
    const [otp, setOtp] = useState("");
    const [pin, setPin] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSendOtp() {
        // TODO(remove once FastAPI /fingerprint-fallback/send is live): mocked.
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 300));
            setSent(true);
            return;
        }

        try {
            await fetch("/api/fingerprint-fallback/send", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            setSent(true);
        } catch {
            setError("Couldn't send a code right now. Try again, or skip this step.");
        }
    }

    async function handleVerify() {
        setSubmitting(true);
        setError(null);

        // TODO(remove once FastAPI /fingerprint-fallback/verify is live): mocked.
        // Dev code fixed at 123456 / PIN 0000 so the mismatch error path stays testable.
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 400));
            if (otp.trim() !== "123456" || pin.trim() !== "0000") {
                setError("That code or PIN didn't match. Try again.");
                setSubmitting(false);
                return;
            }
            const mockSignal: FingerprintSignal = {
                method: "otp-pin",
                confidence: "supporting",
                verifiedAt: new Date().toISOString(),
                detail: { method: "otp-pin", otpChannel: "sms", verified: true },
            };
            onComplete(mockSignal);
            return;
        }

        try {
            const res = await fetch("/api/fingerprint-fallback/verify", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp, pin }),
            });
            const body = await res.json();

            if (!body.verified) {
                setError("That code or PIN didn't match. Try again.");
                setSubmitting(false);
                return;
            }
            onComplete(body.signal as FingerprintSignal);
        } catch {
            setError("Something went wrong. Try again, or skip this step.");
            setSubmitting(false);
        }
    }

    if (!sent) {
        return (
            <div className="flex flex-col gap-6 text-center">
                <div>
                    <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                        Extra check by text
                    </h1>
                    <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
                        We'll text a code to your registered number for an extra check.
                    </p>
                </div>
                <PrimaryButton onClick={handleSendOtp}>Send code</PrimaryButton>
                <SecondaryButton onClick={() => onComplete(null)}>Skip this step</SecondaryButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 text-center">
            <TextField
                label="SMS code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />
            <TextField
                label="Your PIN"
                inputMode="numeric"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
            />
            <PrimaryButton onClick={handleVerify} disabled={submitting}>
                {submitting ? "Checking…" : "Confirm"}
            </PrimaryButton>
            {error && (
                <p role="alert" className="text-sm [color:var(--color-accent-hover)]">
                    {error}
                </p>
            )}
        </div>
    );
}
