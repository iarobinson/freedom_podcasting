"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* Mobile: Sign In + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm px-3 py-1.5 rounded-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Sign In
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded-sm"
            style={{ color: "var(--text-muted)" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-1"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
        >
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="block text-sm py-2.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Blog
          </Link>
          <Link
            href="/tools"
            onClick={() => setMenuOpen(false)}
            className="block text-sm py-2.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Tools
          </Link>
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="block text-sm py-2.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Pricing
          </a>
          <div className="pt-3">
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center text-sm font-medium px-4 py-2.5 rounded-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
