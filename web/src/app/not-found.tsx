import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent mb-1">404</p>
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-ink-100">
            Page Not Found
          </h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>
        <p className="text-sm text-ink-500 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="btn btn-primary text-xs px-4 py-2"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="btn btn-secondary text-xs px-4 py-2"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
