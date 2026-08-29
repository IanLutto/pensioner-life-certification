"use client";

// app/(main)/status/page.tsx
//
// Lightweight National ID lookup, no OTP — this is read-only status
// information, not an action, so the higher-friction login gate used by
// /self-service isn't warranted here. Worth a real privacy conversation
// before this ships though: certification status is still personal data,
// and "no OTP" trades security for convenience — flagged in the README.

import { useState } from "react";
import { CertificateSummary } from "@/components/shared/CertificateSummary";
import type { CertificateSummary as CertificateSummaryType } from "@/lib/certification/types";
import Link from "next/link";

export default function StatusPage() {
  const [nationalId, setNationalId] = useState("");
  const [result, setResult] = useState<CertificateSummaryType | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TODO(remove once FastAPI /self-service/status is live): mocked.
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      await new Promise((r) => setTimeout(r, 400));
      // Deterministic-ish demo behavior: even-length ID "has" a certificate.
      const hasCertificate = nationalId.trim().length % 2 === 0 && nationalId.trim().length > 0;
      setResult(
        hasCertificate
          ? {
              pensionerId: nationalId.trim(),
              issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
              status: "certified",
              nextDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toISOString(),
            }
          : { pensionerId: nationalId.trim(), issuedAt: new Date().toISOString(), status: "not_certified" }
      );
      setChecked(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/self-service/status?nationalId=${encodeURIComponent(nationalId.trim())}`);
      const body = await res.json();
      setResult(body.certificate ?? null);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold leading-snug text-ink font-display">
          Your status
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter your National ID to check your certification status.
        </p>

        <form onSubmit={handleCheck} className="mt-6 flex flex-col gap-4">
          <input
            inputMode="numeric"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="National ID number"
            className="h-14 rounded-xl border border-border bg-transparent px-4 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            required
          />
          <button
            type="submit"
            disabled={loading || nationalId.trim().length === 0}
            className="flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-accent-ink transition-colors bg-accent hover:enabled:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Checking…" : "Check status"}
          </button>
        </form>

        {checked && result?.status === "certified" && <CertificateSummary certificate={result} />}

        {checked && result?.status === "not_certified" && (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border p-4 text-left">
            <p className="text-sm leading-6 text-muted">
              We don't have a certification on file for this period yet.
            </p>
            <Link
              href="/self-service"
              className="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-accent-ink bg-accent hover:bg-accent-hover"
            >
              Start certification
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
