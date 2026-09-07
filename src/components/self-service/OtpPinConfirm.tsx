"use client";

// components/self-service/OtpPinConfirm.tsx
//
// Phase 1 PoC's auth path, per the roadmap: "OTP + PIN as the auth path
// for the PoC — fastest way to a working demo without waiting on
// WebAuthn." Unlike OtpPinFallback (Phase 2, reachable only when WebAuthn
// isn't available), this step is mandatory — no skip button — because for
// the PoC it IS the confirmation step, not a fallback for one.

import { useState } from "react";
import type { AuthConfirmation } from "@/lib/certification/types";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { TextField } from "@/components/shared/ui/TextField";

type Props = {
  onConfirmed: (confirmation: AuthConfirmation) => void;
};

export function OtpPinConfirm({ onConfirmed }: Props) {
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    // TODO(remove once FastAPI /self-service/confirm/send is live): mocked.
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      await new Promise((r) => setTimeout(r, 300));
      setSent(true);
      return;
    }
    try {
      await fetch("/api/self-service/confirm/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setSent(true);
    } catch {
      setError("Couldn't send a code right now. Try again.");
    }
  }

  async function handleVerify() {
    setSubmitting(true);
    setError(null);

    // TODO(remove once FastAPI /self-service/confirm/verify is live): mocked.
    // Dev code 123456 / PIN 0000, so the mismatch error path stays testable.
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      await new Promise((r) => setTimeout(r, 400));
      if (otp.trim() !== "123456" || pin.trim() !== "0000") {
        setError("That code or PIN didn't match. Try again.");
        setSubmitting(false);
        return;
      }
      onConfirmed({ method: "otp-pin", verifiedAt: new Date().toISOString() });
      return;
    }

    try {
      const res = await fetch("/api/self-service/confirm/verify", {
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
      onConfirmed({ method: "otp-pin", verifiedAt: new Date().toISOString() });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
            Confirm it's you
          </h1>
          <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
            We'll text a code to your registered number to finish certifying.
          </p>
        </div>
        <PrimaryButton onClick={handleSendOtp}>Send code</PrimaryButton>
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
