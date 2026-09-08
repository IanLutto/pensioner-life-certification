"use client";

import { useState } from "react";
import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
  category: "biometrics" | "schedule" | "status";
};

const FAQ_LIST: FaqItem[] = [
  {
    category: "biometrics",
    question: "What if facial or voice verification fails?",
    answer:
        "Ensure you are in a well-lit room without bright backlight behind you. Hold your phone steady at eye level. If voice verification fails, move away from background noise and speak clearly into your microphone.",
  },
  {
    category: "schedule",
    question: "How often do I need to complete recertification?",
    answer:
        "Proof-of-life certification is typically required once every 6 months (180 days). You will receive SMS alerts 30 days before your active certificate expires.",
  },
  {
    category: "biometrics",
    question: "Can someone assist an elderly pensioner with the scan?",
    answer:
        "Yes, a caregiver or family member can hold the device and assist with navigating the app. However, the facial scan and voice prompt MUST be performed directly by the pensioner.",
  },
  {
    category: "status",
    question: "How do I verify if my certificate is currently active?",
    answer:
        "You can tap 'Status' in the bottom navigation and enter your National ID number to instantly view your active proof-of-life status and download your record.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center px-6 py-12 pb-24">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold leading-snug [color:var(--color-ink)] [font-family:var(--font-display)]">
              Help & Support
            </h1>
            <p className="mt-2 text-sm leading-relaxed [color:var(--color-muted)]">
              Find quick answers or get in touch with our pension verification support team.
            </p>
          </div>

          {/* Quick Contact Buttons */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors [border-color:var(--color-border)] [background:var(--color-card)] hover:[background:color-mix(in_srgb,var(--color-accent)_5%,transparent)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.643-.585 5.974 5.974 0 01.81-2.927A8.192 8.192 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-bold [color:var(--color-ink)]">WhatsApp Support</span>
              <span className="text-[10px] [color:var(--color-muted)]">Instant Chat</span>
            </a>

            <a
                href="tel:+254700000000"
                className="flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors [border-color:var(--color-border)] [background:var(--color-card)] hover:[background:color-mix(in_srgb,var(--color-accent)_5%,transparent)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.07-5.02-3.264-6.09-6.09l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-bold [color:var(--color-ink)]">Call Toll-Free</span>
              <span className="text-[10px] [color:var(--color-muted)]">Mon–Fri 8am–5pm</span>
            </a>
          </div>

          {/* FAQ Accordion */}
          <div className="mt-8 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider [color:var(--color-muted)]">
              Frequently Asked Questions
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {FAQ_LIST.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className="rounded-2xl border transition-all duration-200 [background:var(--color-card)] [border-color:var(--color-border)]"
                    >
                      <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm [color:var(--color-ink)]"
                      >
                        <span>{faq.question}</span>
                        <svg
                            className={`h-4 w-4 shrink-0 transition-transform duration-200 [color:var(--color-muted)] ${
                                isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {isOpen && (
                          <div className="px-4 pb-4 text-xs leading-relaxed border-t pt-3 [border-color:var(--color-border)] [color:var(--color-muted)]">
                            {faq.answer}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>

          {/* Direct Action Link */}
          <div className="mt-8 rounded-2xl border p-5 text-center [background:color-mix(in_srgb,var(--color-accent)_5%,transparent)] [border-color:var(--color-border)]">
            <h3 className="text-sm font-bold [color:var(--color-ink)]">Ready to verify now?</h3>
            <p className="mt-1 text-xs [color:var(--color-muted)]">
              Complete your proof-of-life check using biometrics and SMS OTP in under 2 minutes.
            </p>
            <Link
                href="/self-service"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full text-xs font-bold transition-colors [background:var(--color-accent)] [color:var(--color-accent-ink)] hover:[background:var(--color-accent-hover)]"
            >
              Start Self-Service Check
            </Link>
          </div>
        </div>
      </main>
  );
}