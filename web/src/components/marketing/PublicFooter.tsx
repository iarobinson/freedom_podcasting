import Link from "next/link";

export function PublicFooter() {
  return (
    <footer
      className="border-t mt-8"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <picture>
              <source
                srcSet="/Freedom-Podcasting-Company-Logo.png"
                media="(prefers-color-scheme: light)"
              />
              <img
                src="/Freedom-Podcasting-Company-Logo-white-red.png"
                alt="Freedom Podcasting"
                width={160}
                height={53}
                style={{ height: "28px", width: "auto", marginBottom: "12px" }}
              />
            </picture>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-faint)" }}>
              Professional podcast hosting for creators and the teams that support them.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
              Product
            </p>
            <ul className="space-y-2">
              {[
                { href: "/#pricing", label: "Pricing" },
                { href: "/blog", label: "Blog" },
                { href: "/tools", label: "Free Tools" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
              Company
            </p>
            <ul className="space-y-2">
              {[
                { href: "/auth/register", label: "Start Free" },
                { href: "/auth/login", label: "Sign In" },
                { href: "/wp-plugin/privacy", label: "Privacy Policy" },
                { href: "/wp-plugin/terms", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            © {new Date().getFullYear()} FreedomPodcasting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
