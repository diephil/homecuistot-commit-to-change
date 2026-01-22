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
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom right, #fca5a5, #fdba74, #fde047)",
            padding: "1.5rem",
          }}
        >
          {/* Decorative shapes */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                top: "2.5rem",
                left: "2.5rem",
                width: "5rem",
                height: "5rem",
                background: "#f87171",
                border: "3px solid black",
                opacity: 0.3,
                transform: "rotate(12deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "5rem",
                right: "2.5rem",
                width: "6rem",
                height: "6rem",
                background: "#fb923c",
                border: "3px solid black",
                opacity: 0.3,
                transform: "rotate(-6deg)",
              }}
            />
          </div>

          {/* Main error card */}
          <div
            style={{
              position: "relative",
              maxWidth: "32rem",
              width: "100%",
              border: "4px solid black",
              background: "linear-gradient(to bottom right, #fca5a5, #fdba74)",
              boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
              padding: "2.5rem",
              transform: "rotate(-1deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem",
                textAlign: "center",
              }}
            >
              {/* Error icon */}
              <div
                style={{
                  background: "#f87171",
                  border: "3px solid black",
                  padding: "1.5rem",
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                  transform: "rotate(2deg)",
                }}
              >
                <svg
                  style={{ width: "4rem", height: "4rem" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <div>
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  Critical Error
                </h1>
                <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  Something went seriously wrong!
                </p>
              </div>

              {/* Error message */}
              {process.env.NODE_ENV === "development" && (
                <div
                  style={{
                    width: "100%",
                    background: "white",
                    border: "2px solid black",
                    padding: "1rem",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      wordBreak: "break-word",
                    }}
                  >
                    {error.message}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                <button
                  onClick={reset}
                  style={{
                    width: "100%",
                    padding: "1.25rem",
                    background: "#22d3ee",
                    border: "4px solid black",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    fontSize: "1.125rem",
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = "2px 2px 0px 0px rgba(0,0,0,1)";
                    e.currentTarget.style.transform = "translate(2px, 2px)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = "4px 4px 0px 0px rgba(0,0,0,1)";
                    e.currentTarget.style.transform = "translate(0, 0)";
                  }}
                >
                  Try Again
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  style={{
                    width: "100%",
                    padding: "1.25rem",
                    background: "#facc15",
                    border: "4px solid black",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    fontSize: "1.125rem",
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = "2px 2px 0px 0px rgba(0,0,0,1)";
                    e.currentTarget.style.transform = "translate(2px, 2px)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = "4px 4px 0px 0px rgba(0,0,0,1)";
                    e.currentTarget.style.transform = "translate(0, 0)";
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
