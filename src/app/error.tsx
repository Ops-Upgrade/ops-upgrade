"use client";

import { useEffect } from "react";

/**
 * Segment-level error boundary for ops-upgrade.
 *
 * Catches unhandled errors thrown by any Server or Client Component in the
 * same route segment, below the root GlobalError boundary. Renders a safe,
 * opaque message — never exposes the raw error to the browser.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the digest (server-generated opaque reference) so it can be
    // correlated with server logs without exposing detail to the user.
    if (error.digest) {
      console.error("Error digest:", error.digest);
    }
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "50vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#71717a", margin: 0 }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          borderRadius: "0.375rem",
          backgroundColor: "#18181b",
          color: "#fff",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
