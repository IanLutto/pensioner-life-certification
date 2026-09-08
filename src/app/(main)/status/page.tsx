"use client";

// app/(main)/status/page.tsx
//
// Lightweight lookup for National ID or Opaque Verification Token (QR code)

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CertificateSummary } from "@/components/shared/CertificateSummary";
import { TextField } from "@/components/shared/ui/TextField";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import type { CertificateSummary as CertificateSummaryType } from "@/lib/certification/types";

export default function StatusPage() {
  const searchParams = useSearchParams();
  const refToken = searchParams.get("ref");

  const [nationalId, setNationalId] = useState("");
  const [result, setResult] = useState<CertificateSummaryType | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleInputChange(val: string) {
    // Keep numeric characters only for National ID
    const cleanVal = val.replace(/\D/g, "");
    setNationalId(cleanVal);
    if (error) setError(null);
  }

  // Unified lookup function for National ID or QR Verification Token
  const fetchStatus = useCallback(async (queryParam: { nationalId?: string; ref?: string }) => {
    setLoading(true);
    setError(null);

    const isMock = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

    if (isMock) {
      await new Promise((r) => setTimeout(r, 600));
      const searchVal = queryParam.nationalId || queryParam.ref || "";
      const hasCertificate = searchVal.trim().length % 2 === 0 && searchVal.trim().length >= 6;

      setResult(
          hasCertificate
              ? {
                pensionerId: queryParam.nationalId ?? "12345678",
                referenceCode: queryParam.ref ?? "REF-2026-8942",
                issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                status: "certified",
                nextDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toISOString(),
                verificationToken: queryParam.ref ?? "mock_token_abc123",
              }
              : {
                pensionerId: searchVal.trim(),
                referenceCode: "N/A",
                issuedAt: new Date().toISOString(),
                status: "expired",
              }
      );
      setChecked(true);
      setLoading(false);
      return;
    }

    try {
      const endpoint = queryParam.ref
          ? `/api/self-service/status?ref=${encodeURIComponent(queryParam.ref)}`
          : `/api/self-service/status?nationalId=${encodeURIComponent(queryParam.nationalId!)}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch certification status.");

      const body = await res.json();
      setResult(body.certificate ?? { pensionerId: queryParam.nationalId ?? "Unknown", status: "not_certified" });
      setChecked(true);
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to retrieve status. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically trigger check if user arrived via a QR code scan (?ref=...)
  // app/(main)/status/page.tsx

  useEffect(() => {
    if (!refToken) return;

    let isMounted = true;

    const runStatusCheck = async () => {
      // Defers execution off the synchronous mount phase
      await Promise.resolve();
      if (isMounted) {
        fetchStatus({ ref: refToken });
      }
    };

    runStatusCheck();

    return () => {
      isMounted = false;
    };
  }, [refToken, fetchStatus]);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!nationalId.trim()) return;
    fetchStatus({ nationalId: nationalId.trim() });
  }

  return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          {/* Header */}
          <h1 className="text-2xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
            Certification Status
          </h1>
          <p className="mt-2 text-sm leading-relaxed [color:var(--color-muted)]">
            Enter your National ID number to verify your current pension proof-of-life status.
          </p>

          {/* Search Form (Hide input if user landed via QR token to prevent confusion) */}
          {!refToken && (
              <form onSubmit={handleCheck} className="mt-8 flex flex-col gap-5 text-left">
                <TextField
                    label="National ID Number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 12345678"
                    value={nationalId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    error={error || undefined}
                    required
                />

                <PrimaryButton
                    type="submit"
                    disabled={loading || nationalId.trim().length < 6}
                >
                  {loading ? "Checking Status…" : "Check Status"}
                </PrimaryButton>
              </form>
          )}

          {/* Loading Indicator for direct QR visits */}
          {loading && refToken && (
              <p className="mt-8 text-sm font-medium [color:var(--color-muted)]">
                Verifying certificate token…
              </p>
          )}

          {/* Result Block: Certified */}
          {checked && result?.status === "certified" && (
              <div className="mt-8 text-left">
                <CertificateSummary
                    certificate={result}
                    isPublicVerification={Boolean(refToken)}
                />
              </div>
          )}

          {/* Result Block: Not Certified (FIXED: Handles both "pending" and "expired") */}
          {checked && (result?.status === "pending" || result?.status === "expired") && (
              <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-xs [background:var(--color-card)] [border-color:var(--color-border)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold [color:var(--color-ink)]">
                    No Active Certificate Found
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed [color:var(--color-muted)]">
                    We don&#39;t have an active recorded certification on file for this account.
                  </p>
                </div>
                <Link
                    href="/self-service"
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)]"
                >
                  Start Certification Now
                </Link>
              </div>
          )}
        </div>
      </main>
  );
}