// app/manifest.ts
//
// Next.js serves this automatically at /manifest.webmanifest and injects
// the <link rel="manifest"> tag — no manual head tag needed.

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "CPF Life Certification",
        short_name: "Life Cert",
        description: "Certify your pension from your phone — a quick photo and you're done.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F7F8F4", // matches --color-surface — shown on the splash screen
        theme_color: "#2F5D50", // matches --color-accent — colors the OS status bar/browser chrome
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}