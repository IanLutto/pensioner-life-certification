"use client";

// components/self-service/FingerprintStep.tsx
//
// Only reached when liveness comes back "borderline" — this is the
// confidence booster the flowchart calls out, not a step every pensioner sees.
// Skip, fail, or fall back to OTP+PIN, and the risk decision downstream
// still runs; this step just adds a signal to it.

import { useEffect, useState } from "react";
import { isPlatformAuthenticatorAvailable, assertDevice } from "@/lib/webauthn/client";
import type { FingerprintSignal } from "@/lib/webauthn/types";
import { OtpPinFallback } from "./OtpPinFallback";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import { SecondaryButton } from "@/components/shared/ui/SecondaryButton";

type Props = {
    onComplete: (signal: FingerprintSignal | null) => void; // null = skipped/unavailable, still valid
};

type UiState = "checking" | "offer-webauthn" | "prompting" | "fallback" | "error";

export function FingerprintStep({ onComplete }: Props) {
    const [state, setState] = useState<UiState>("checking");

    useEffect(() => {
        (async () => {
            const supported = await isPlatformAuthenticatorAvailable();
            setState(supported ? "offer-webauthn" : "fallback");
        })();
    }, []);

    async function handleTryWebAuthn() {
        setState("prompting");
        try {
            const result = await assertDevice();

            if (!result.available) {
                setState("fallback");
                return;
            }
            if (result.verified) {
                onComplete(result.signal);
                return;
            }
            setState("fallback");
        } catch {
            setState("fallback");
        }
    }

    if (state === "checking") {
        return <p className="text-center text-sm [color:var(--color-muted)]">Checking device capabilities…</p>;
    }

    if (state === "offer-webauthn" || state === "prompting") {
        return (
            <div className="flex flex-col gap-6 text-center">
                <div>
                    <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                        One more check
                    </h1>
                    <p className="mt-2 text-sm leading-6 [color:var(--color-muted)]">
                        Add extra confidence using your phone's fingerprint or face unlock.
                    </p>
                </div>
                <PrimaryButton onClick={handleTryWebAuthn} disabled={state === "prompting"}>
                    {state === "prompting" ? "Follow the prompt on your screen…" : "Confirm with device"}
                </PrimaryButton>
                <SecondaryButton onClick={() => setState("fallback")}>Skip this step</SecondaryButton>
            </div>
        );
    }

    return <OtpPinFallback onComplete={(signal) => onComplete(signal)} />;
}
