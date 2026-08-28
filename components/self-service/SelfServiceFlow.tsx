"use client";

// components/self-service/SelfServiceFlow.tsx
//
// PHASE 1 POC SCOPE — per the roadmap:
//   "OTP + PIN as the auth path for the PoC — fastest way to a working
//    demo without waiting on WebAuthn. WebAuthn kept as an isolated
//    prototype alongside this, not gating the PoC."
//
// So: ID entry -> OTP login -> liveness (Part A placeholder) -> OTP+PIN
// confirm (mandatory) -> minimal certificate. No WebAuthn, no strong/
// borderline risk branching — that logic belongs to Phase 2
// "Convergence," once the mandatory-vs-opportunistic decision is made
// and it can lean on a real business-rules engine (a Phase 1 CRO-track
// deliverable, not something this PoC has yet).
//
// The isolated WebAuthn prototype lives separately at
// app/prototypes/webauthn — not imported here, on purpose.

import { useState } from "react";
import { IdEntryForm } from "./IdEntryForm";
import { OtpVerifyForm } from "./OtpVerifyForm";
import { FaceLivenessStepPlaceholder } from "./FaceLivenessStepPlaceholder";
import { OtpPinConfirm } from "./OtpPinConfirm";
import { FlowShell } from "./FlowShell";
import { Seal } from "@/components/shared/ui/Seal";
import { CertificateSummary } from "@/components/shared/CertificateSummary";
import type {
    AuthConfirmation,
    CertificateSummary as CertificateSummaryType,
    LivenessResult,
} from "@/lib/certification/types";

type Step = "id-entry" | "otp-verify" | "liveness" | "confirm" | "done";

export function SelfServiceFlow() {
    const [step, setStep] = useState<Step>("id-entry");
    const [nationalId, setNationalId] = useState("");
    const [maskedPhone, setMaskedPhone] = useState("");
    // Captured for later audit/logging even though the PoC doesn't branch on
    // it yet — Phase 2's risk decision will need this history.
    const [liveness, setLiveness] = useState<LivenessResult | null>(null);
    const [certificate, setCertificate] = useState<CertificateSummaryType | null>(null);

    function handleConfirmed(_confirmation: AuthConfirmation) {
        setCertificate({
            pensionerId: nationalId,
            issuedAt: new Date().toISOString(),
            status: "certified",
        });
        setStep("done");
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
                <FaceLivenessStepPlaceholder
                    onComplete={(result) => {
                        setLiveness(result);
                        setStep("confirm"); // always confirm — no branching in the PoC
                    }}
                />
            </FlowShell>
        );
    }

    if (step === "confirm") {
        return (
            <FlowShell stepIndex={3}>
                <OtpPinConfirm onConfirmed={handleConfirmed} />
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
            {certificate && <CertificateSummary certificate={certificate} />}
        </div>
    );
}
