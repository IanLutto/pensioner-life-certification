"use client";

// components/self-service/SelfServiceFlow.tsx
//
// Full flow, treated as the real thing rather than a throwaway PoC:
// ID entry -> OTP login -> liveness (Part A placeholder) -> branch on
// confidence -> certificate.
//   - "strong" liveness: certify directly, no further step.
//   - "borderline" liveness: route into the fingerprint booster
//     (WebAuthn, falling back to OTP+PIN) before certifying.
// The booster is still optional even on the borderline path — skipping
// it doesn't block certification, it's an input to the risk decision,
// not a gate.

import { useState } from "react";
import { IdEntryForm } from "./IdEntryForm";
import { OtpVerifyForm } from "./OtpVerifyForm";
import { FaceLivenessCapture } from "./FaceLivenessCapture";
import { FingerprintStep } from "./FingerprintStep";
import { FlowShell } from "./FlowShell";
import { Seal } from "@/components/shared/ui/Seal";
import { CertificateSummary } from "@/components/shared/CertificateSummary";
import type { CertificateSummary as CertificateSummaryType, LivenessResult } from "@/lib/certification/types";
import type { FingerprintSignal } from "@/lib/webauthn/types";

type Step = "id-entry" | "otp-verify" | "liveness" | "fingerprint" | "done";

export function SelfServiceFlow() {
    const [step, setStep] = useState<Step>("id-entry");
    const [nationalId, setNationalId] = useState("");
    const [maskedPhone, setMaskedPhone] = useState("");
    const [liveness, setLiveness] = useState<LivenessResult | null>(null);
    const [fingerprintSignal, setFingerprintSignal] = useState<FingerprintSignal | null>(null);
    const [certificate, setCertificate] = useState<CertificateSummaryType | null>(null);

    function issueCertificate() {
        setCertificate({
            pensionerId: nationalId,
            issuedAt: new Date().toISOString(),
            status: "certified",
        });
        setStep("done");
    }

    function handleLivenessComplete(result: LivenessResult) {
        setLiveness(result);
        // The branch point: strong confidence certifies immediately; borderline
        // routes into the fingerprint booster as an extra input to the risk
        // decision before certifying.
        if (result.confidence === "strong") {
            issueCertificate();
        } else {
            setStep("fingerprint");
        }
    }

    if (step === "id-entry") {
        return (
            <FlowShell stepIndex={0}>
                <IdEntryForm
                    onSubmitted={(id, phone) => {
                        setNationalId(id);
                        setMaskedPhone(phone);
                        setStep("otp-verify");
                    }}
                />
            </FlowShell>
        );
    }

    if (step === "otp-verify") {
        return (
            <FlowShell stepIndex={1}>
                <OtpVerifyForm
                    nationalId={nationalId}
                    maskedPhone={maskedPhone}
                    onVerified={() => setStep("liveness")}
                />
            </FlowShell>
        );
    }

    if (step === "liveness") {
        return (
            <FlowShell stepIndex={2}>
                <FaceLivenessCapture onComplete={handleLivenessComplete} />
            </FlowShell>
        );
    }

    if (step === "fingerprint") {
        return (
            <FlowShell stepIndex={3}>
                <FingerprintStep
                    onComplete={(signal) => {
                        setFingerprintSignal(signal); // may be null — the risk decision still runs
                        issueCertificate();
                    }}
                />
            </FlowShell>
        );
    }

    // step === "done"
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center [background:var(--color-bg)]">
            <Seal animated={false} />
            <h1 className="mt-8 text-2xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
                You're certified
            </h1>
            <p className="mt-3 max-w-xs text-base leading-7 [color:var(--color-muted)]">
                Your pension payments will continue as normal.
            </p>
            {liveness?.confidence === "borderline" && (
                <p className="mt-4 text-xs [color:var(--color-muted)]">
                    Extra confidence check: {fingerprintSignal ? fingerprintSignal.method : "skipped"}
                </p>
            )}
            {certificate && <CertificateSummary certificate={certificate} />}
        </div>
    );
}
