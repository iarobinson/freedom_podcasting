import Link from "next/link";
import Image from "next/image";

export function PublicNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "color-mix(in srgb, var(--bg-canvas) 85%, transparent)",
        borderColor: "var(--border-subtle)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <picture>
            <source
              srcSet="/Freedom-Podcasting-Company-Logo.png"
              media="(prefers-color-scheme: light)"
            />
            <img
              src="/Freedom-Podcasting-Company-Logo-white-red.png"
              alt="Freedom Podcasting"
              width={180}
              height={60}
              style={{ height: "32px", width: "auto" }}
            />
          </picture>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/blog"
            className="text-sm px-3 py-1.5 rounded-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-body)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Blog
          </Link>
          <Link
            href="/tools"
            className="text-sm px-3 py-1.5 rounded-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-body)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Tools
          </Link>
          <a
            href="#pricing"
            className="text-sm px-3 py-1.5 rounded-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-body)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Pricing
          </a>
          <Link
            href="/auth/login"
            className="text-sm px-3 py-1.5 rounded-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-body)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="ml-2 text-sm font-medium px-4 py-1.5 rounded-sm text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
