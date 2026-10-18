"use client";

import { useEffect } from "react";

/**
 * Lightweight client error reporter for pilot monitoring.
 * Posts to /api/errors — no PII beyond path/UA.
 */
export function ErrorReporter() {
  useEffect(() => {
    const send = (payload: {
      message: string;
      stack?: string;
      path?: string;
      source: string;
    }) => {
      const body = JSON.stringify({
        ...payload,
        path: payload.path || window.location.pathname,
        userAgent: navigator.userAgent,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/errors",
          new Blob([body], { type: "application/json" }),
        );
      } else {
        void fetch("/api/errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    };

    const onError = (event: ErrorEvent) => {
      send({
        message: event.message || "Unknown error",
        stack: event.error?.stack,
        source: "window.onerror",
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      send({
        message:
          typeof reason === "string"
            ? reason
            : reason?.message || "Unhandled rejection",
        stack: reason?.stack,
        source: "unhandledrejection",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
