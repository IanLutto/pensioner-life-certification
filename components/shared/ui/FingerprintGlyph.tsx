// components/shared/ui/FingerprintGlyph.tsx
//
// Hand-drawn concentric-arc fingerprint icon — no icon library dependency
// assumed, since lucide-react etc. aren't confirmed installed in this project.

export function FingerprintGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12 3.5c-3.5 0-6 2.2-6 5.4 0 2.6.3 4.7 1.1 6.6" />
      <path d="M12 3.5c3.6 0 6.3 2.3 6.3 5.6 0 1.3-.1 2.5-.3 3.6" />
      <path d="M8.6 20.2c-1-1.6-1.7-3.3-2.1-5.1" />
      <path d="M9.2 8.6c0-1.7 1.3-2.9 2.9-2.9s2.9 1.2 2.9 2.9c0 3-.2 5.4.9 8" />
      <path d="M12 9.2c-1.1 0-1.9.8-1.9 1.9 0 3.6.6 6.5 2.3 9" />
      <path d="M14.1 11.1c.1.6.1 1.3.1 2 0 2.6.4 4.7 1.4 6.6" />
    </svg>
  );
}
