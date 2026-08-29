"use client";

// components/self-service/FingerprintStep.tsx
//
// Only reached when liveness comes back "borderline" — this is the
// confidence booster, not a step every pensioner sees. Skip, fail, or
// fall back to OTP+PIN, and the risk decision downstream still runs;
// this step just adds a signal to it.
//
// Using native Tailwind theme utilities here (bg-accent, text-ink, etc.)
// rather than the [color:var(--x)] bracket syntax used elsewhere in the
// project — both work identically since app/globals.css defines these
// via Tailwind v4's @theme block, which generates real utility classes.
// No need to migrate older files for this to work; it's just tidier going
// forward now that the @theme setup is confirmed.

import { useEffect, useState } from "react";
import { isPlatformAuthenticatorAvailable, assertDevice } from "@/lib/webauthn/client";
import type { FingerprintSignal } from "@/lib/webauthn/types";
import { OtpPinFallback } from "./OtpPinFallback";
import { FingerprintGlyph } from "@/components/shared/ui/FingerprintGlyph";

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
        return <p className="text-center text-sm text-muted">Checking device capabilities…</p>;
    }

    if (state === "offer-webauthn" || state === "prompting") {
        const isPrompting = state === "prompting";
        return (
            <div className="flex flex-col items-center gap-6 text-center">
                <div>
                    <h1 className="text-xl font-semibold leading-snug text-ink font-display">
                        One more check
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted">
                        {isPrompting
                            ? "Follow the prompt on your screen."
                            : "Add extra confidence using your phone's fingerprint or face unlock."}
                    </p>
                </div>

                <div className="relative flex h-24 w-24 items-center justify-center">
                    {isPrompting && (
                        <span className="seal-ring absolute inset-0 rounded-full border-2 border-dashed border-accent" />
                    )}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-bg">
                        <FingerprintGlyph className="h-8 w-8" />
                    </div>
                </div>

                <button
                    onClick={handleTryWebAuthn}
                    disabled={isPrompting}
                    className="flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-accent-ink transition-colors bg-accent hover:enabled:bg-accent-hover disabled:opacity-60"
                >
                    {isPrompting ? "Waiting…" : "Confirm with device"}
                </button>
                <button
                    onClick={() => setState("fallback")}
                    disabled={isPrompting}
                    className="flex h-12 w-full items-center justify-center rounded-full border border-border text-base font-medium text-ink disabled:opacity-50"
                >
                    Skip this step
                </button>
            </div>
        );
    }

    return <OtpPinFallback onComplete={(signal) => onComplete(signal)} />;
}
