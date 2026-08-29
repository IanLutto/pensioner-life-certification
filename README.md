# Pension self-certification PWA — current state

This is a **frontend-only** Next.js (App Router) project. The real
backend is FastAPI, joined via a reverse-proxy rewrite (see "Backend"
below) — nothing in `lib/` or `components/` here should grow real
business logic; it should call `/api/*` and let FastAPI handle it.

## Setup

```bash
npm install
npm install @simplewebauthn/server @simplewebauthn/browser
```

Create `.env.local`:
```
NEXT_PUBLIC_USE_MOCKS=true
SESSION_SECRET=<any string for local dev>
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

With `NEXT_PUBLIC_USE_MOCKS=true`, the entire self-service flow runs
end-to-end with **no backend running at all** — every fetch call that
would hit FastAPI is gated behind that flag. Search the codebase for
`NEXT_PUBLIC_USE_MOCKS` to see every mocked call site, and for
`TODO(remove once FastAPI` to find exactly what needs to change once
each real endpoint exists.

## Where to drop this in

Copy the contents of this zip's `src/app`, `components/`, and `lib/`
folders directly over the matching folders in your project root
(`pensioner-life-certification/`). Restart `npm run dev` afterward —
new route-group folders in particular sometimes need a fresh server to
be picked up.

**One folder name matters exactly as written**: `src/app` — the
parentheses are part of Next.js's route-group syntax, not a typo. Don't
rename it to `src/app`.

## Route map

```
/                    → landing page (has bottom nav)
/status              → check certification status by National ID (has bottom nav)
/help                → support contact + FAQ (has bottom nav)
/self-service        → the certification flow itself (NO bottom nav — see below)
/prototypes/webauthn → isolated WebAuthn test harness, not linked from real UI
```

The bottom nav (`components/shared/ui/BottomNav.tsx`) only wraps `/`,
`/status`, and `/help`, via `src/app`. It's deliberately
absent from `/self-service` — that's a focused, linear task, and a tab
bar inviting a pensioner to jump away mid-certification would undercut
the step-by-step design `FlowShell.tsx` already enforces.

## The self-service flow, step by step

`components/self-service/SelfServiceFlow.tsx` is the state machine:

1. **National ID entry** (`IdEntryForm.tsx`) → same generic response
   whether or not the ID matches, to prevent enumeration.
2. **OTP verification** (`OtpVerifyForm.tsx`) → on success, the *real*
   FastAPI backend is expected to set an httpOnly session cookie.
   Everything downstream trusts that cookie, never a pensionerId the
   client sends directly (`lib/session/get-session-pensioner.ts` is the
   pattern to follow for any new session-scoped route).
3. **Face + liveness** (`FaceLivenessCapture.tsx`) — **fully real**
   camera capture: `getUserMedia` live preview, 3-2-1 countdown, an
   actual 2.5s `MediaRecorder` video burst, uploaded via
   `lib/media/liveness-client.ts`. Only the analysis *result* is mocked
   (no backend model exists yet) — the capture mechanics work today.
   Required step, no skip button.
4. **Branch**: strong confidence → certify immediately. Borderline →
5. **Fingerprint booster** (`FingerprintStep.tsx`) — WebAuthn first,
   falling back to OTP+PIN (`OtpPinFallback.tsx`) on any failure,
   absence, or decline. Always optional, even on the borderline path —
   skipping it is an input to the risk decision, not a blocker.
6. **Certificate** (`CertificateSummary.tsx`) — minimal by design, no
   QR/signature yet (that's later-phase scope per the team roadmap).

## Known rough edges / open decisions

- **`components/self-service/OtpPinConfirm.tsx` and
  `src/app` are unused dead code**, left in place on
  purpose rather than deleted (see conversation history for why) —
  safe to remove whenever convenient.
- **`/status` has no auth gate at all** — just a National ID, no OTP.
  That's a real privacy tradeoff (certification status is personal
  data) worth a team decision, not something to treat as settled.
- **The liveness endpoint contract is a guess**
  (`POST /api/liveness/check`, multipart `video` field, returns
  `{ passed, confidence, capturedAt }`). Confirm the real shape once
  Kevin's research becomes an actual model spec — if it returns
  something richer than a two-tier confidence string, both
  `lib/certification/types.ts` and `FaceLivenessCapture.tsx` need to
  change together.
- **In-memory stores** (`lib/webauthn/store.ts`,
  `lib/webauthn/challenges.ts`, `lib/otp/otp-service.ts`'s OTP map) —
  fine for local dev, not for anything deployed. This whole concern
  moves to FastAPI/a real DB anyway once that integration happens.

## Backend

Everything under `/api/*` is expected to be forwarded to FastAPI via a
Next.js rewrite:

```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${process.env.BACKEND_URL}/:path*` },
    ];
  },
};
```

This project does **not** include Next.js API route handlers — an
earlier draft did, and they were deleted on purpose. If you see an
`src/app` folder reappear with actual route.ts logic in it, that's a
regression, not a feature; it can silently intercept requests that
should be reaching FastAPI.
