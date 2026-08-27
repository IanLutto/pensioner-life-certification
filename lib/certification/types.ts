// lib/certification/types.ts
//
// Deliberately separate from lib/prototypes/types.ts. That file's
// FingerprintSignal is Phase 2 vocabulary (WebAuthn + its fallback,
// merged into the main flow once the mandatory-vs-opportunistic decision
// is made). The PoC's confirm step is just OTP+PIN, full stop — giving it
// its own type keeps Phase 1 code from quietly importing Phase 2 concepts
// before that decision exists.

export type AuthConfirmation = {
  method: "otp-pin";
  verifiedAt: string;
};

// No QR, no digital signature — those are explicitly Phase 3 ("Enhanced
// certificate: QR + digital signature"). This is the Phase 1 PoC's
// "minimal certificate issuance for internal demo."
export type CertificateSummary = {
  pensionerId: string;
  issuedAt: string;
  status: "certified";
};
