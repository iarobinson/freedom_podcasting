"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { useAuthStore } from "@/lib/store";
import { wordpressTokensApi } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OrganizationSummary } from "@/types";

type View = "loading" | "login" | "connect" | "connecting" | "error";

function ConnectWordPressContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url") ?? "";

  const { user, token, login, fetchMe } = useAuthStore();

  const [view, setView] = useState<View>("loading");
  const [selectedOrgSlug, setSelectedOrgSlug] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  let callbackHost = "";
  try { callbackHost = new URL(callbackUrl).hostname; } catch {}

  const callbackValid = callbackUrl.startsWith("https://") && callbackHost !== "";

  useEffect(() => {
    if (!callbackValid) {
      setErrorMsg("Invalid or missing callback URL. The URL must start with https://.");
      setView("error");
      return;
    }
    if (token) {
      fetchMe()
        .then(() => setView("connect"))
        .catch(() => setView("login"));
    } else {
      setView("login");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default org once user is available
  useEffect(() => {
    if (user && !selectedOrgSlug) {
      setSelectedOrgSlug(user.organizations[0]?.slug ?? "");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      setView("connect");
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      setLoginError(
        status === 401 || status === 422
          ? "Invalid email or password."
          : "Unable to reach the server. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedOrgSlug) return;
    setView("connecting");
    try {
      const res = await wordpressTokensApi.create(selectedOrgSlug, callbackUrl);
      const pat: string = res.data.data.token;
      const redirect = new URL(callbackUrl);
      redirect.searchParams.set("fp_token", pat);
      window.location.href = redirect.toString();
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      setErrorMsg(
        status === 403
          ? "You need manager or owner access to connect this organization."
          : "Something went wrong. Please try again."
      );
      setView("error");
    }
  };

  const selectedOrg: OrganizationSummary | undefined =
    user?.organizations.find((o) => o.slug === selectedOrgSlug);

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      {/* Background engraving */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute right-0 top-0 opacity-[0.03] w-[600px] h-[600px]" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="60" stroke="white" strokeWidth="0.5"/>
          <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="0.5"/>
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="0.5"/>
        </svg>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 mb-4 overflow-hidden">
            <Logo size={48} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">
            Freedom Podcasting
          </p>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-100 mt-1">
            Connect WordPress
          </h1>
          <hr className="accent-rule mt-3 mx-auto w-16" />
        </div>

        {/* Loading */}
        {view === "loading" && (
          <div className="panel p-6 shimmer-bg h-40" />
        )}

        {/* Error */}
        {view === "error" && (
          <div className="panel p-6 space-y-4 text-center">
            <p className="text-[11px] text-accent uppercase tracking-wide">{errorMsg}</p>
            <p className="text-[11px] text-ink-500">
              Please close this window and try reconnecting from your WordPress site.
            </p>
          </div>
        )}

        {/* Login */}
        {view === "login" && (
          <div className="space-y-4">
            {callbackHost && (
              <div className="panel p-3 text-center">
                <p className="text-[10px] text-ink-500 uppercase tracking-widest">Connecting to</p>
                <p className="text-sm font-semibold text-ink-100 mt-0.5">{callbackHost}</p>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="panel p-6 space-y-4">
                <p className="text-[10px] text-ink-500 uppercase tracking-widest">
                  Sign in to authorize the connection
                </p>
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                {loginError && (
                  <p className="text-[11px] text-accent uppercase tracking-wide">{loginError}</p>
                )}
                <Button type="submit" loading={loginLoading} className="w-full" size="lg">
                  Sign In &amp; Continue
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Connect — org selector */}
        {(view === "connect" || view === "connecting") && user && (
          <div className="space-y-4">
            {callbackHost && (
              <div className="panel p-3 text-center">
                <p className="text-[10px] text-ink-500 uppercase tracking-widest">Connecting to</p>
                <p className="text-sm font-semibold text-ink-100 mt-0.5">{callbackHost}</p>
              </div>
            )}
            <div className="panel p-6 space-y-5">
              <div>
                <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-1">
                  Signed in as
                </p>
                <p className="text-sm text-ink-100">{user.email}</p>
              </div>

              {user.organizations.length > 1 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-ink-500 uppercase tracking-widest">
                    Select organization
                  </p>
                  <div className="space-y-1">
                    {user.organizations.map((org) => (
                      <button
                        key={org.slug}
                        type="button"
                        onClick={() => setSelectedOrgSlug(org.slug)}
                        className={[
                          "w-full text-left px-3 py-2.5 rounded border text-sm transition-colors",
                          selectedOrgSlug === org.slug
                            ? "border-accent bg-accent/10 text-ink-100"
                            : "border-ink-800 text-ink-400 hover:border-ink-600 hover:text-ink-200",
                        ].join(" ")}
                      >
                        <span className="font-medium">{org.name}</span>
                        <span className="ml-2 text-[10px] uppercase tracking-widest opacity-60">
                          {org.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user.organizations.length === 1 && selectedOrg && (
                <div>
                  <p className="text-[10px] text-ink-500 uppercase tracking-widest mb-1">
                    Organization
                  </p>
                  <p className="text-sm text-ink-100">{selectedOrg.name}</p>
                </div>
              )}

              <div className="border-t border-ink-800 pt-4">
                <p className="text-[10px] text-ink-500 leading-relaxed mb-4">
                  This will allow{" "}
                  <span className="text-ink-300">{callbackHost}</span> to upload
                  episodes and manage podcasts on your behalf.
                </p>
                <Button
                  onClick={handleConnect}
                  loading={view === "connecting"}
                  disabled={!selectedOrgSlug}
                  className="w-full"
                  size="lg"
                >
                  Authorize Connection
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                useAuthStore.getState().logout();
                setView("login");
              }}
              className="w-full text-center text-[10px] text-ink-600 hover:text-ink-400 uppercase tracking-widest transition-colors"
            >
              Sign in as a different user
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConnectWordPressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="panel p-6 shimmer-bg h-64" />
        </div>
      </div>
    }>
      <ConnectWordPressContent />
    </Suspense>
  );
}
