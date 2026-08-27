"use client";

// components/self-service/EnrollDevice.tsx
//
// Run this once — e.g. offered after a pensioner's first successful
// self-service certification via face+liveness+OTP — to register their
// phone for the faster WebAuthn path on future certifications. Entirely
// optional; declining has zero effect on eligibility.

import { useEffect, useState } from "react";
import { isPlatformAuthenticatorAvailable, enrollDevice } from "@/lib/webauthn/client";

export function EnrollDevice() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [status, setStatus] = useState<"idle" | "enrolling" | "done" | "error">("idle");

    useEffect(() => {
        isPlatformAuthenticatorAvailable().then(setSupported);
    }, []);

    if (supported === false) return null; // don't offer what the device can't do
    if (supported === null) return null;  // still checking

    async function handleEnroll() {
        setStatus("enrolling");
        try {
            const label =
                typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 40) : undefined;
            const result = await enrollDevice(label);
            setStatus(result.verified ? "done" : "error");
        } catch {
            setStatus("error");
        }
    }

    if (status === "done") return <p>This phone is now set up for faster check-ins.</p>;

    return (
        <div>
            <p>Want faster check-ins next time? Register this phone&#39;s fingerprint/face unlock.</p>
            <button onClick={handleEnroll} disabled={status === "enrolling"}>
                {status === "enrolling" ? "Follow the prompt on your screen…" : "Register this device"}
            </button>
            {status === "error" && <p role="alert">Couldn&#39;t register — you can try again anytime.</p>}
        </div>
    );
}
