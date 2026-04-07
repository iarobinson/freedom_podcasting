import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Terms of Service — WordPress Plugin",
  description: "Terms of service for the Freedom Podcasting WordPress plugin.",
};

export default function WpPluginTermsPage() {
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
            WordPress Plugin — Terms of Service
          </h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
          <p className="text-[11px] text-ink-500 mt-4 uppercase tracking-widest">
            Effective date: April 7, 2025
          </p>
        </div>

        <div className="panel p-8 space-y-8 text-sm text-ink-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              1. Overview
            </h2>
            <p>
              The Freedom Podcasting WordPress plugin (&ldquo;Plugin&rdquo;) is free software distributed
              under the GPL-2.0-or-later license. It generates a podcast RSS feed from your WordPress
              posts and optionally connects to the Freedom Podcasting platform
              (&ldquo;Service&rdquo;) at{" "}
              <a
                href="https://freedompodcasting.com"
                className="text-ink-200 hover:text-accent transition-colors"
              >
                freedompodcasting.com
              </a>{" "}
              for managed audio hosting.
            </p>
            <p>
              By installing the Plugin or using the Service connection, you agree to these terms.
              The RSS feed and local metadata features work entirely within your WordPress site and
              are not subject to these terms beyond the GPL license.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              2. The Service Connection (Optional)
            </h2>
            <p>
              The Plugin can optionally connect to the Freedom Podcasting API to upload and host
              your audio files. This connection is entirely optional. To use it you must have an
              account at{" "}
              <a
                href="https://app.freedompodcasting.com"
                className="text-ink-200 hover:text-accent transition-colors"
              >
                app.freedompodcasting.com
              </a>{" "}
              and explicitly authorize the connection from your WordPress settings page.
            </p>
            <p>
              When connected, your WordPress site communicates directly with the Freedom Podcasting
              API using a personal access token stored in your WordPress database. You can revoke
              this connection at any time from Settings &rarr; Freedom Podcasting &rarr; Disconnect.
              Disconnecting immediately invalidates the access token.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              3. Acceptable Use
            </h2>
            <p>You agree not to use the Plugin or the Service connection to:</p>
            <ul className="list-disc list-inside space-y-1 text-ink-400 pl-2">
              <li>Upload content that infringes any copyright or other intellectual property right</li>
              <li>Upload or distribute malware, spam, or illegal content</li>
              <li>Attempt to circumvent, reverse-engineer, or overload our API infrastructure</li>
              <li>Use the API credentials of another user without their authorization</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              4. Content Ownership
            </h2>
            <p>
              You retain full ownership of all audio files and podcast metadata you upload through
              the Plugin. By uploading files you grant Freedom Podcasting a limited license to store,
              process, and serve the files for the purpose of operating the hosting service. This
              license ends when you delete the files or close your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              5. Service Availability
            </h2>
            <p>
              We aim for high availability but provide no uptime guarantee. The Plugin will continue
              to function for RSS feed generation and local metadata management regardless of
              Service availability. Audio files already hosted will remain accessible as long as
              your account is active.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              6. Disclaimer of Warranties
            </h2>
            <p>
              The Plugin is provided &ldquo;as is&rdquo; under the GPL-2.0-or-later license, without
              warranty of any kind. The Service connection is provided &ldquo;as is&rdquo; without
              warranty of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Freedom Podcasting shall not be
              liable for any indirect, incidental, special, or consequential damages arising from
              your use of the Plugin or Service, including loss of data or revenue.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              8. Changes to These Terms
            </h2>
            <p>
              We may update these terms from time to time. The effective date at the top of this
              page will be updated accordingly. Continued use of the Service connection after any
              change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-100">
              9. Contact
            </h2>
            <p>
              Questions about these terms?{" "}
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
            href="/wp-plugin/privacy"
            className="text-[11px] text-ink-500 hover:text-accent uppercase tracking-widest transition-colors"
          >
            Privacy Policy
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
