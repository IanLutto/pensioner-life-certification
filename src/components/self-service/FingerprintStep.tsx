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

"use client";

import { useEffect, useState } from "react";
import { isPlatformAuthenticatorAvailable } from "@/lib/webauthn/client";
import type { FingerprintSignal } from "@/lib/webauthn/types";
import { OtpPinFallback } from "./OtpPinFallback";
import { FingerprintGlyph } from "@/components/shared/ui/FingerprintGlyph";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";

type Props = {
    onComplete: (signal: FingerprintSignal | null) => void; // null = skipped/fallback used
};

type UiState = "checking" | "offer-webauthn" | "prompting" | "fallback";

export function FingerprintStep({ onComplete }: Props) {
    const [state, setState] = useState<UiState>("checking");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        async function checkCapability() {
            try {
                const supported = await isPlatformAuthenticatorAvailable();
                if (supported && window.PublicKeyCredential) {
                    setState("offer-webauthn");
                } else {
                    setState("fallback");
                }
            } catch {
                setState("fallback");
            }
        }
        checkCapability();
    }, []);

    function bufferToBase64Url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    // Directly trigger the browser/device biometric prompt via WebAuthn
    async function handleTriggerBiometric() {
        setState("prompting");
        setErrorMessage(null);

        // Dev/Mock fallback environment handling
        if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
            await new Promise((r) => setTimeout(r, 800));
            onComplete({
                method: "webauthn",
                confidence: "supporting",
                verifiedAt: new Date().toISOString(),
                detail: {
                    method: "webauthn",
                    credentialId: "mock-credential-id-12345",
                    newCounter: 1,
                },
            });
            return;
        }

        try {
            // Generate a random challenge buffer for non-repudiation
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const credential = (await navigator.credentials.get({
                publicKey: {
                    challenge,
                    timeout: 60000,
                    userVerification: "required", // Forces device fingerprint/FaceID prompt
                },
            })) as PublicKeyCredential | null;

            if (credential) {
                // Extract WebAuthn assertion response payload if available
                const response = credential.response as AuthenticatorAssertionResponse | undefined;

                const signal: FingerprintSignal = {
                    method: "webauthn",
                    confidence: "supporting",
                    verifiedAt: new Date().toISOString(),
                    detail: {
                        method: "webauthn",
                        credentialId: credential.id,
                        // Helper to convert ArrayBuffer to Base64URL string if required by your backend
                        clientDataJSON: response?.clientDataJSON
                            ? bufferToBase64Url(response.clientDataJSON)
                            : undefined,
                        authenticatorData: response?.authenticatorData
                            ? bufferToBase64Url(response.authenticatorData)
                            : undefined,
                        signature: response?.signature
                            ? bufferToBase64Url(response.signature)
                            : undefined,
                    },
                };

                onComplete(signal);
            } else {
                setState("fallback");
            }
        } catch (err: unknown) {
            console.error("Biometric verification error:", err);

            // Handle user cancellation or failure vs technical issue
            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setErrorMessage("Biometric check was canceled or timed out. You can try again or use PIN fallback.");
            } else {
                setErrorMessage("Unable to verify fingerprint. Continuing with PIN verification.");
            }

            setState("offer-webauthn");
        }
    }

    if (state === "checking") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent [border-color:var(--color-accent)]" />
                <p className="text-sm font-medium [color:var(--color-muted)]">
                    Checking device capabilities…
                </p>
            </div>
        );
    }

    if (state === "offer-webauthn" || state === "prompting") {
        const isPrompting = state === "prompting";

        return (
            <div className="flex flex-col items-center gap-6 text-center">
                <div>
                    <h1 className="text-xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                        Secondary Verification
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed [color:var(--color-muted)]">
                        {isPrompting
                            ? "Touch the fingerprint sensor or look at your device when prompted."
                            : "Use your phone's fingerprint sensor or Face Unlock to verify your identity."}
                    </p>
                </div>

                {/* Animated Biometric Icon Frame */}
                <div className="relative flex h-28 w-28 items-center justify-center">
                    {isPrompting && (
                        <span className="absolute inset-0 animate-ping rounded-full opacity-20 [background:var(--color-accent)]" />
                    )}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full shadow-inner [background:var(--color-ink)] [color:var(--color-bg)]">
                        <FingerprintGlyph className="h-10 w-10" />
                    </div>
                </div>

                {errorMessage && (
                    <p role="alert" className="text-xs font-medium [color:var(--color-accent-hover)]">
                        {errorMessage}
                    </p>
                )}

                {/* Primary Action Button */}
                <PrimaryButton
                    onClick={handleTriggerBiometric}
                    disabled={isPrompting}
                >
                    {isPrompting ? "Waiting for device…" : "Confirm with Fingerprint"}
                </PrimaryButton>

                {/* Fallback Option */}
                <button
                    type="button"
                    onClick={() => setState("fallback")}
                    disabled={isPrompting}
                    className="h-12 w-full rounded-full border text-sm font-semibold transition-colors disabled:opacity-50 [border-color:var(--color-border)] [color:var(--color-ink)] hover:[background:var(--color-bg)]"
                >
                    Use SMS / Security PIN instead
                </button>
            </div>
        );
    }

    return <OtpPinFallback onComplete={(signal) => onComplete(signal)} />;
}
