"use client";

// components/prototypes/WebAuthnSpike.tsx
//
// This is the "WebAuthn feasibility spike" (Phase 0) and "WebAuthn kept
// as an isolated prototype alongside" (Phase 1). Deliberately NOT wired
// into SelfServiceFlow — reachable only via /prototypes/prototypes for
// internal testing while the mandatory-vs-opportunistic decision gets
// made. Once that decision lands, this logic (EnrollDevice/FingerprintStep,
// already built) merges into the main flow as Phase 2 work — this page
// can retire at that point rather than growing alongside it.

import { useState } from "react";
import { EnrollDevice } from "@/components/self-service/EnrollDevice";
import { FingerprintStep } from "@/components/self-service/FingerprintStep";
import { PrimaryButton } from "@/components/shared/ui/PrimaryButton";
import type { FingerprintSignal } from "@/lib/webauthn/types";

export function WebAuthnSpike() {
  const [mode, setMode] = useState<"idle" | "enroll" | "assert">("idle");
  const [log, setLog] = useState<string[]>([]);

  function appendLog(entry: string) {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${entry}`]);
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12 [background:var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 rounded-xl border p-4 text-sm [border-color:var(--color-accent)] [color:var(--color-muted)]">
          <strong className="[color:var(--color-ink)]">Internal prototype.</strong> Not part
          of the pensioner-facing PoC flow. For the Phase 0/1 WebAuthn feasibility spike and the
          mandatory-vs-opportunistic decision only.
        </div>

        {mode === "idle" && (
          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={() => setMode("enroll")}>Test: Enroll device</PrimaryButton>
            <PrimaryButton onClick={() => setMode("assert")}>Test: Assert device</PrimaryButton>
          </div>
        )}

        {mode === "enroll" && (
          <div className="rounded-2xl border [border-color:var(--color-border)] [background:var(--color-card)] p-8">
            <EnrollDevice />
            <button
              className="mt-4 text-sm underline [color:var(--color-muted)]"
              onClick={() => setMode("idle")}
            >
              Back
            </button>
          </div>
        )}

        {mode === "assert" && (
          <div className="rounded-2xl border [border-color:var(--color-border)] [background:var(--color-card)] p-8">
            <FingerprintStep
              onComplete={(signal: FingerprintSignal | null) => {
                appendLog(signal ? `assert succeeded via ${signal.method}` : "assert skipped/unavailable");
                setMode("idle");
              }}
            />
          </div>
        )}

        {log.length > 0 && (
          <div className="mt-8 rounded-xl border p-4 text-xs [border-color:var(--color-border)] [color:var(--color-muted)]">
            <p className="mb-2 font-semibold uppercase tracking-wide">Session log</p>
            {log.map((entry, i) => (
              <p key={i}>{entry}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
