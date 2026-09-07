// lib/prototypes/types.ts
//
// WebAuthn serves strictly as a SUPPORTING confidence signal on top of face + liveness.
// Nothing here represents a raw fingerprint template — WebAuthn only provides cryptographic
// proof that the platform authenticator (TouchID/FaceID/Android Biometrics) verified the user locally.

export type StoredCredential = {
    pensionerId: string;
    credentialId: string;       // base64url-encoded credential ID
    publicKey: string;          // base64url-encoded COSE public key
    counter: number;            // signature counter for replay protection
    deviceLabel?: string;       // e.g., "Samsung Galaxy enrolled 2026-08-25"
    createdAt: string;
};

export type FingerprintSignal = {
    method: "webauthn" | "otp-pin";
    confidence: "supporting";   // Always supporting for this channel — face + liveness remains primary
    verifiedAt: string;
    detail:
        | {
        method: "webauthn";
        credentialId: string;
        clientDataJSON?: string;     // base64url assertion response from navigator.credentials.get
        authenticatorData?: string;  // base64url authenticator data
        signature?: string;          // base64url cryptographic signature
        newCounter?: number;
    }
        | {
        method: "otp-pin";
        otpChannel: "sms";
        verified: true;
    };
};

// Server-side credential repository interface
export interface CredentialStore {
    getByPensionerId(pensionerId: string): Promise<StoredCredential | null>;
    getByCredentialId(credentialId: string): Promise<StoredCredential | null>;
    save(cred: StoredCredential): Promise<void>;
    updateCounter(pensionerId: string, credentialId: string, counter: number): Promise<void>;
}