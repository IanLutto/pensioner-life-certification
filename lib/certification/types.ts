// lib/certification/types.ts
//
// Deliberately separate from lib/webauthn/types.ts. That file's
// FingerprintSignal is Phase 2 vocabulary (WebAuthn + its fallback,
// merged into the main flow once the mandatory-vs-opportunistic decision
// is made). The PoC's confirm step is just OTP+PIN, full stop — giving it
// its own type keeps Phase 1 code from quietly importing Phase 2 concepts
// before that decision exists.

export type AuthConfirmation = {
  method: "otp-pin";
  verifiedAt: string;
};

// Placeholder shape for Kevin's Part A output. Confidence is captured for
// future audit/logging even though the Phase 1 PoC doesn't branch on it —
// see SelfServiceFlow.tsx for why that branching is deferred to Phase 2.
export type LivenessResult = {
  passed: boolean;
  confidence: "strong" | "borderline";
  capturedAt: string;
};

// No QR, no digital signature — those are explicitly Phase 3 ("Enhanced
// certificate: QR + digital signature"). This is the Phase 1 PoC's
// "minimal certificate issuance for internal demo."
export type CertificateSummary = {
  pensionerId: string;
  issuedAt: string;
  status: "certified";
};
