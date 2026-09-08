// lib/pdf/exportCertificate.ts
import html2pdf from "html2pdf.js";

export async function exportCertificateToPdf(
    elementId: string,
    filename: string = "certificate-summary.pdf"
): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id #${elementId} not found.`);
        return;
    }

    const options = {
        margin: 15, // Margin in mm
        filename: filename,
        image: { type: "png", quality: 0.98 },
        html2canvas: {
            scale: 2, // 2x resolution for crisp text
            useCORS: true,
            backgroundColor: "#ffffff", // Standard HEX background
            onclone: (clonedDoc: Document) => {
                // 1. Remove chrome-extension and invalid stylesheets
                const styleSheets = Array.from(
                    clonedDoc.querySelectorAll("link[rel='stylesheet'], style")
                );
                styleSheets.forEach((sheet) => {
                    const href = sheet.getAttribute("href");
                    if (
                        href &&
                        (href.startsWith("chrome-extension://") || href.includes("invalid"))
                    ) {
                        sheet.remove();
                    }
                });

                // 2. Resolve modern CSS oklab/oklch colors to standard computed RGB values
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    const allElements = clonedElement.querySelectorAll("*");
                    const elementsToProcess = [clonedElement, ...Array.from(allElements)];

                    elementsToProcess.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        const computed = window.getComputedStyle(htmlEl);

                        if (
                            computed.backgroundColor &&
                            computed.backgroundColor !== "rgba(0, 0, 0, 0)"
                        ) {
                            htmlEl.style.backgroundColor = computed.backgroundColor;
                        }
                        if (computed.color) {
                            htmlEl.style.color = computed.color;
                        }
                        if (computed.borderColor) {
                            htmlEl.style.borderColor = computed.borderColor;
                        }
                    });
                }
            },
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
        },
    };

    try {
        await html2pdf().set(options).from(element).save();
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error;
    }
}