// lib/prototypes/client.ts
// Browser-only helpers. Import these from client components only.

import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
    try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

// No pensionerId param anymore — the httpOnly session cookie set at login
// (see app/api/self-service/verify-otp/route.ts) is what these routes trust.
// `credentials: "include"` is the default for same-origin fetch, kept
// explicit here as a reminder that the cookie is load-bearing.
//
// TODO(remove once FastAPI /prototypes/* routes are live): both functions
// below skip the real WebAuthn ceremony entirely when mocked, rather than
// calling startRegistration/startAuthentication with fake options — those
// browser APIs talk to real OS-level credential storage, and without a
// backend actually issuing/verifying challenges there's no valid ceremony
// to complete. Mocking at this level (not inside the fetch calls) avoids
// triggering a real, doomed-to-fail OS biometric prompt.

export async function enrollDevice(deviceLabel?: string) {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
        await new Promise((r) => setTimeout(r, 500));
        return { verified: true };
    }

    const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
    if (!optionsRes.ok) return { verified: false, error: "no active session" };
    const options = await optionsRes.json();

    const attResp = await startRegistration(options); // triggers the OS biometric prompt

    const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: attResp, deviceLabel }),
    });
    return verifyRes.json(); // { verified: true } | { error }
}

export async function assertDevice() {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
        await new Promise((r) => setTimeout(r, 500));
        const mockSignal = {
            method: "prototypes" as const,
            confidence: "supporting" as const,
            verifiedAt: new Date().toISOString(),
            detail: { method: "prototypes" as const, credentialId: "mock-credential", newCounter: 1 },
        };
        return { available: true as const, verified: true, signal: mockSignal };
    }

    const optionsRes = await fetch("/api/webauthn/assert/options", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
    if (!optionsRes.ok) return { available: false as const };
    const optionsBody = await optionsRes.json();

    if (!optionsBody.available) {
        return { available: false as const };
    }

    const authResp = await startAuthentication(optionsBody.options); // OS biometric prompt

    const verifyRes = await fetch("/api/webauthn/assert/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResp }),
    });
    const result = await verifyRes.json();
    return { available: true as const, ...result }; // { verified, signal } | { error }
}