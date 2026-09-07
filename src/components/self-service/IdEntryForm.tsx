"use client";

// components/self-service/IdEntryForm.tsx
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

    // Sanitize input to only permit numbers
    function handleInputChange(value: string) {
        const numericOnly = value.replace(/\D/g, "");
        setNationalId(numericOnly);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const cleanedId = nationalId.trim();

        // Basic length sanity check (Kenyan IDs are typically 6 to 8 digits)
        if (cleanedId.length < 6) {
            setError("Please enter a valid National ID number (at least 6 digits).");
            return;
        }

        setSubmitting(true);
        setError(null);

        // Mock response fallback for dev
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 500));
            onSubmitted(cleanedId, "•••• •• 4821");
            return;
        }

        try {
            const res = await fetch("/api/self-service/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nationalId: cleanedId }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const body = await res.json();
            onSubmitted(cleanedId, body.maskedPhone || "•••• •• 4821");

        } catch (err) {
            console.error("ID Lookup Error:", err);
            setError("Unable to process request. Please check your connection and try again.");
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
                    We will send a one-time verification code to the phone number registered to this ID.
                </p>
            </div>

            <div className="text-left">
                <TextField
                    label="National ID / Pension Number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder="e.g. 12345678"
                    value={nationalId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    required
                />
                <p className="mt-1.5 text-xs [color:var(--color-muted)]">
                    Enter numbers only as shown on your Kenyan ID card.
                </p>
            </div>

            <PrimaryButton
                type="submit"
                disabled={submitting || nationalId.trim().length < 6}
            >
                {submitting ? "Checking details…" : "Send code →"}
            </PrimaryButton>

            {error && (
                <p role="alert" aria-live="assertive" className="text-sm font-medium [color:var(--color-accent-hover)]">
                    {error}
                </p>
            )}
        </form>
    );
}