"use client";

// components/self-service/SelfServiceFlow.tsx
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
        // Generate a 6-character reference code for pensioner reassurance
        const refCode = "CPF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        setCertificate({
            pensionerId: nationalId,
            issuedAt: new Date().toISOString(),
            status: "certified",
            referenceCode: refCode, // Added reference number
        });
        setStep("done");
    }

    function handleLivenessComplete(result: LivenessResult) {
        setLiveness(result);
        if (result.confidence === "strong") {
            issueCertificate();
        } else {
            setStep("fingerprint");
        }
    }

    // --- STEP 1: National ID / Pension Number ---
    if (step === "id-entry") {
        return (
            <FlowShell stepIndex={0} title="Identity Verification">
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

    // --- STEP 2: Phone OTP Verification ---
    if (step === "otp-verify") {
        return (
            <FlowShell
                stepIndex={1}
                title="Phone Verification"
                onBack={() => setStep("id-entry")}
            >
                <OtpVerifyForm
                    nationalId={nationalId}
                    maskedPhone={maskedPhone}
                    onVerified={() => setStep("liveness")}
                />
            </FlowShell>
        );
    }

    // --- STEP 3: Face Liveness Capture ---
    if (step === "liveness") {
        return (
            <FlowShell
                stepIndex={2}
                title="Facial Verification"
                onBack={() => setStep("otp-verify")}
            >
                <FaceLivenessCapture onComplete={handleLivenessComplete} />
            </FlowShell>
        );
    }

    // --- STEP 4: Secondary Biometric / Fingerprint (Borderline Risk) ---
    if (step === "fingerprint") {
        return (
            <FlowShell
                stepIndex={3}
                title="Additional Security Verification"
                onBack={() => setStep("liveness")}
            >
                <FingerprintStep
                    onComplete={(signal) => {
                        setFingerprintSignal(signal);
                        issueCertificate();
                    }}
                />
            </FlowShell>
        );
    }

    // --- STEP 5: Success / Certification Summary ---
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center [background:var(--color-bg)]">
            <main className="flex w-full max-w-sm flex-col items-center">

                {/* Official CPF Seal */}
                <div className="mb-4">
                    <Seal animated={false} />
                </div>

                {/* Success Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold [background:var(--color-card)] [color:var(--color-focus)] border [border-color:var(--color-border)] mb-4">
                    ✓ Certification Complete
                </span>

                <h1 className="text-2xl font-bold leading-tight [color:var(--color-ink)] [font-family:var(--font-display)]">
                    You are certified!
                </h1>

                <p className="mt-2 text-sm leading-relaxed [color:var(--color-muted)]">
                    Your CPF pension verification is active. Your monthly payments will continue as scheduled.
                </p>

                {/* Risk Signal Note */}
                {liveness?.confidence === "borderline" && (
                    <div className="mt-4 rounded-lg p-2.5 text-xs border w-full [background:var(--color-card)] [border-color:var(--color-border)] [color:var(--color-muted)]">
                        Secondary Security Step: <span className="font-semibold [color:var(--color-ink)]">{fingerprintSignal ? fingerprintSignal.method : "Skipped"}</span>
                    </div>
                )}

                {/* Certificate Component */}
                {certificate && (
                    <div className="mt-6 w-full">
                        <CertificateSummary certificate={certificate} />
                    </div>
                )}

                {/* Session Actions */}
                <div className="mt-8 flex w-full flex-col gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold border shadow-2xs transition-all [background:var(--color-card)] [color:var(--color-ink)] [border-color:var(--color-border)] hover:[background:var(--color-bg)] active:scale-[0.99]"
                    >
                        🖨️ Download or Print Receipt
                    </button>

                    <a
                        href="/"
                        className="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-all [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)] active:scale-[0.99]"
                    >
                        Done & Exit
                    </a>
                </div>

                {/* Help Info */}
                <p className="mt-6 text-xs [color:var(--color-muted)]">
                    Need help with your payout? Call <a href="tel:0800720072" className="underline font-semibold [color:var(--color-ink)]">0800 720 072</a>
                </p>
            </main>
        </div>
    );
}