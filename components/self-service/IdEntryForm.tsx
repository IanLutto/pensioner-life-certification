"use client";

// components/self-service/IdEntryForm.tsx
//
// First thing a pensioner sees after "Start certification." Deliberately
// doesn't reveal whether the ID matched a record — same message either
// way — to avoid turning this into an ID-enumeration tool. Real "not
// found" cases surface later, if at all, through a support channel
// rather than this form.

import { useState } from "react";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { TextField } from "@/components/shared/ui/TextField";

type Props = {
  onSubmitted: (nationalId: string, maskedPhone: string) => void;
};

export function IdEntryForm({ onSubmitted }: Props) {
  const [nationalId, setNationalId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // TODO(remove once FastAPI /self-service/lookup is live): mocked so the
    // frontend flow can be built/demoed ahead of the backend. Flip
    // NEXT_PUBLIC_USE_MOCKS to "false" the moment that route is real.
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      await new Promise((r) => setTimeout(r, 400)); // mimic network latency
      onSubmitted(nationalId.trim(), "•••• •• 4821");
      return;
    }

    try {
      const res = await fetch("/api/self-service/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId: nationalId.trim() }),
      });
      const body = await res.json();
      onSubmitted(nationalId.trim(), body.maskedPhone);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
            Confirm your National ID
          </h1>
          <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
            We'll send a code to the phone number on file for this ID.
          </p>
        </div>

        <TextField
            label="National ID number"
            inputMode="numeric"
            autoComplete="off"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            required
        />

        <PrimaryButton type="submit" disabled={submitting || nationalId.trim().length === 0}>
          {submitting ? "Checking…" : "Continue"}
        </PrimaryButton>

        {error && (
            <p role="alert" className="text-sm [color:var(--color-accent-hover)]">
              {error}
            </p>
        )}
      </form>
  );
}
