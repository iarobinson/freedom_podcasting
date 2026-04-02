"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error.message, error.digest ?? "", error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="panel rounded-sm p-8 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="font-display text-lg font-bold uppercase tracking-widest text-ink-100">
          Something went wrong
        </h1>
        <p className="text-sm text-ink-500">
          An unexpected error occurred. Our team has been notified.
          {error.digest && (
            <span className="block mt-1 font-mono text-xs text-ink-700">
              Ref: {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
