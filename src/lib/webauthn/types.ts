// lib/prototypes/types.ts
//
// These types describe WebAuthn strictly as a SUPPORTING confidence signal
// on top of face + liveness. Nothing here represents a fingerprint template
// or a database match — WebAuthn never gives us either.

export type StoredCredential = {
    pensionerId: string;
    credentialId: string;       // base64url
    publicKey: string;          // base64url-encoded COSE public key
    counter: number;            // signature counter, replay protection
    deviceLabel?: string;       // e.g. "iPhone enrolled 2026-08-25"
    createdAt: string;
};

export type FingerprintSignal = {
    method: "prototypes" | "otp-pin";
    confidence: "supporting";   // always supporting for this channel — never authoritative
    verifiedAt: string;
    detail:
        | { method: "prototypes"; credentialId: string; newCounter: number }
        | { method: "otp-pin"; otpChannel: "sms"; verified: true };
};

// Minimal server-side store interface. Swap the in-memory implementation
// in store.ts for your real pensioner DB table.
export interface CredentialStore {
    get(pensionerId: string): Promise<StoredCredential | null>;
    save(cred: StoredCredential): Promise<void>;
    updateCounter(pensionerId: string, credentialId: string, counter: number): Promise<void>;
}