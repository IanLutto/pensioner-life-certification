"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { CertificateSummary as CertificateSummaryType } from "@/lib/certification/types";
import { exportCertificateToPdf } from "@/lib/pdf/exportCertificate";

type Props = {
    certificate: CertificateSummaryType;
    className?: string;
};

export function CertificateSummary({ certificate, className = "" }: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const containerId = `certificate-card-${certificate.pensionerId}`;

    const issuedDate = new Date(certificate.issuedAt);
    const nextDueDate = certificate.nextDueAt ? new Date(certificate.nextDueAt) : null;

    const now = new Date();
    const daysRemaining = nextDueDate
        ? Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
    const isOverdue = daysRemaining !== null && daysRemaining <= 0;

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(d);

    // FIX: previously encoded certificate.pensionerId (the pensioner's raw
    // national ID) directly into a scannable, printable QR code — anyone who
    // scanned or photographed a certificate could look up that person by ID.
    // Now uses the existing opaque referenceCode field instead. Worth
    // confirming with whoever generates it that it's actually random/signed,
    // not sequential — a guessable reference code has the same enumeration
    // risk as the national ID did.
    //
    // FIX: previously branched on `typeof window !== "undefined"` to build
    // this URL, which produces a different string during SSR than during
    // client hydration — a guaranteed hydration mismatch (the same category
    // of bug that broke the self-service form's onChange handler earlier).
    // NEXT_PUBLIC_* env vars are inlined at build time, so this is identical
    // on server and client with no window dependency at all.
    const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? "";
    const verificationUrl = `${appOrigin}/status?ref=${encodeURIComponent(certificate.referenceCode)}`;

    async function handleDownloadPdf() {
        setIsExporting(true);
        try {
            await exportCertificateToPdf(
                containerId,
                `Certificate_${certificate.pensionerId}.pdf`
            );
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Downloadable Certificate Card */}
            <div
                id={containerId}
                className={`flex flex-col gap-5 rounded-3xl border p-6 shadow-xs transition-all duration-200
                    [background:var(--color-card)] [border-color:var(--color-border)] ${className}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 [border-color:var(--color-border)]">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider [color:var(--color-muted)]">
                            Proof-of-Life
                        </span>
                        <h3 className="text-lg font-bold [color:var(--color-ink)] [font-family:var(--font-display)]">
                            Certification Record
                        </h3>
                    </div>

                    {certificate.status === "certified" && !isOverdue ? (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                isExpiringSoon
                                    ? "[background:color-mix(in_srgb,var(--color-warning)_10%,transparent)] [color:var(--color-warning)] [border-color:color-mix(in_srgb,var(--color-warning)_20%,transparent)]"
                                    : "[background:color-mix(in_srgb,var(--color-success)_10%,transparent)] [color:var(--color-success)] [border-color:color-mix(in_srgb,var(--color-success)_20%,transparent)]"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${isExpiringSoon ? "animate-pulse" : ""}`}
                                style={{ backgroundColor: isExpiringSoon ? "var(--color-warning)" : "var(--color-success)" }}
                            />
                            {isExpiringSoon ? "Expiring Soon" : "Certified"}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold [background:color-mix(in_srgb,var(--color-error)_10%,transparent)] [color:var(--color-error)] [border-color:color-mix(in_srgb,var(--color-error)_20%,transparent)]">
                            <span className="h-2 w-2 rounded-full [background:var(--color-error)]" />
                            Needs Renewal
                        </span>
                    )}
                </div>

                {/* Details Grid + Verification QR Code */}
                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 flex flex-col gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium [color:var(--color-muted)]">
                                Pensioner ID
                            </span>
                            <span className="text-sm font-bold [color:var(--color-ink)]">
                                {certificate.pensionerId}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-medium [color:var(--color-muted)]">
                                Verified On
                            </span>
                            <span className="text-sm font-bold [color:var(--color-ink)]">
                                {formatDate(issuedDate)}
                            </span>
                        </div>
                    </div>

                    {/* QR Code Block — now points at an opaque token, not the national ID */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center [border-color:var(--color-border)] [background:var(--color-card)]">
                        <QRCodeSVG
                            value={verificationUrl}
                            size={72}
                            level="M"
                            marginSize={0}
                            className="shrink-0"
                        />
                        <span className="mt-1.5 text-[10px] font-bold uppercase tracking-tight [color:var(--color-muted)]">
                            Scan to Verify
                        </span>
                    </div>

                    {/* Next Due Date Banner */}
                    {nextDueDate && (
                        <div className="col-span-3 flex items-center justify-between rounded-xl p-3.5 border [background:color-mix(in_srgb,var(--color-accent)_5%,transparent)] [border-color:var(--color-border)]">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium [color:var(--color-muted)]">
                                    Next Recertification Due
                                </span>
                                <span className="text-sm font-bold [color:var(--color-ink)]">
                                    {formatDate(nextDueDate)}
                                </span>
                            </div>

                            {daysRemaining !== null && (
                                <div className="text-right">
                                    <span className="text-xs font-bold uppercase tracking-wide [color:var(--color-muted)]">
                                        {daysRemaining > 0 ? `${daysRemaining} Days Left` : "Overdue"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FIX: this previously claimed "Biometrics & OTP" — but per
                    lib/certification/types.ts, Phase 1's confirm step is
                    OTP+PIN only, and LivenessResult isn't branched on yet.
                    A certificate shouldn't claim a verification method that
                    isn't actually part of the certification decision yet.
                    Restore "Biometrics & OTP" once liveness is wired into
                    the decision (Phase 2/3), not before. */}
                <p className="text-xs font-medium flex items-center gap-1 pt-1 [color:var(--color-success)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified with OTP
                </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 px-2">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors [color:var(--color-muted)] hover:[color:var(--color-ink)]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227L6.34 18m11.32 0h-11.32" />
                    </svg>
                    Print
                </button>

                <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 [border-color:var(--color-border)] [color:var(--color-ink)] hover:[background:var(--color-card)]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {isExporting ? "Generating PDF…" : "Download PDF"}
                </button>
            </div>
        </div>
    );
}