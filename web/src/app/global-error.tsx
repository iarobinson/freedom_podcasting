"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.message, error.digest ?? "", error.stack);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0a0a0a", color: "#e5e5e5", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Application Error
          </h1>
          <p style={{ color: "#737373", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            A critical error occurred. Please refresh the page.
            {error.digest && (
              <span style={{ display: "block", marginTop: "0.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#404040" }}>
                Ref: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{ background: "#cc0000", color: "#fff", border: "none", padding: "0.5rem 1.5rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
