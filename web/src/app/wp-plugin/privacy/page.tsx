import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — WordPress Plugin",
  description: "Privacy policy for the Freedom Podcasting WordPress plugin.",
};

export default function WpPluginPrivacyPage() {
  return (
    <div className="min-h-screen bg-ink-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-12 w-12 mb-4 overflow-hidden">
            <Logo size={48} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">
            Freedom Podcasting
          </p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">
            WordPress Plugin — Privacy Policy
          </h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
          <p className="text-[11px] text-ink-500 mt-4 uppercase tracking-widest">
            Effective date: April 7, 2025
          </p>
        </div>

        <div className="panel p-8 space-y-8 text-sm text-ink-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              1. Who This Applies To
            </h2>
            <p>
              This privacy policy describes how Freedom Podcasting handles data transmitted through
              the Freedom Podcasting WordPress plugin (&ldquo;Plugin&rdquo;). It covers only the
              optional Service connection — the plugin&rsquo;s standalone RSS feed and metadata
              features store all data exclusively in your own WordPress database and send nothing
              to us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              2. Data Collected When You Connect
            </h2>
            <p>
              When you authorize the Service connection from your WordPress settings, the following
              data is transmitted to our API at{" "}
              <span className="text-ink-200">api.freedompodcasting.com</span>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-ink-400 pl-2">
              <li>
                <span className="text-ink-200">Podcast show metadata</span> — title, description,
                author name, contact email, language, category, artwork URL, and website URL
              </li>
              <li>
                <span className="text-ink-200">Audio files</span> — MP3 or other audio files you
                upload through the Episode Details meta box
              </li>
              <li>
                <span className="text-ink-200">Your WordPress site URL</span> — included as the
                callback origin during the authorization flow
              </li>
            </ul>
            <p>
              No WordPress user data (passwords, email addresses of subscribers, visitor analytics,
              or post content other than what you explicitly upload) is ever transmitted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              3. How We Use Your Data
            </h2>
            <p>Data transmitted through the Plugin is used solely to:</p>
            <ul className="list-disc list-inside space-y-1 text-ink-400 pl-2">
              <li>Store and serve your audio files via our CDN</li>
              <li>Populate your podcast&rsquo;s metadata within your Freedom Podcasting account</li>
              <li>Generate a public CDN URL returned to your WordPress site for use in the RSS feed</li>
            </ul>
            <p>
              We do not sell your data, use it for advertising, or share it with third parties
              except as required to operate the hosting service (e.g. our CDN provider, Cloudflare R2).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              4. Access Tokens
            </h2>
            <p>
              The authorization flow creates a personal access token (&ldquo;PAT&rdquo;) scoped to
              your organization. This token is stored in your WordPress database (the{" "}
              <code className="text-ink-200 text-xs bg-ink-900 px-1 py-0.5 rounded">
                fp_access_token
              </code>{" "}
              option, autoload disabled) and is used to authenticate API requests from your site.
            </p>
            <p>
              You can revoke the token at any time by clicking Disconnect on the Settings &rarr;
              Freedom Podcasting page. Disconnection immediately invalidates the token on our servers
              and deletes it from your WordPress database.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              5. Data Retention
            </h2>
            <p>
              Audio files and podcast metadata are retained on our servers for as long as your
              Freedom Podcasting account is active. You can delete individual files from within the
              Freedom Podcasting dashboard. Closing your account permanently deletes all associated
              files and metadata within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              6. Sub-processors
            </h2>
            <p>
              Audio files are stored on Cloudflare R2 object storage. Cloudflare&rsquo;s privacy
              policy is available at{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                className="text-ink-200 hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                cloudflare.com/privacypolicy
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              7. Your Rights
            </h2>
            <p>
              You can export or delete your data at any time from the Freedom Podcasting dashboard.
              To request a full data export or account deletion, contact us at{" "}
              <a
                href="mailto:hello@freedompodcasting.com"
                className="text-ink-200 hover:text-accent transition-colors"
              >
                hello@freedompodcasting.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. The effective date at the top of this
              page will be updated accordingly. Material changes will be announced in the plugin
              changelog.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              9. Contact
            </h2>
            <p>
              Privacy questions or data requests:{" "}
              <a
                href="mailto:hello@freedompodcasting.com"
                className="text-ink-200 hover:text-accent transition-colors"
              >
                hello@freedompodcasting.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 text-center space-x-6">
          <Link
            href="/wp-plugin/terms"
            className="text-[11px] text-ink-500 hover:text-accent uppercase tracking-widest transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/"
            className="text-[11px] text-ink-500 hover:text-accent uppercase tracking-widest transition-colors"
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
