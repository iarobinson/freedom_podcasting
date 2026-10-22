"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic2, ArrowRight, Download, ImageIcon, UserPlus, Link2, Zap, Activity } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { podcastsApi, organizationsApi } from "@/lib/api";
import { PLAN_CATALOGUE, formatBytes } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DirectorySubmissionBanner } from "@/components/dashboard/DirectorySubmissionBanner";
import type { Podcast, OrgOverview } from "@/types";

function relativeTime(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60)   return `${Math.max(mins, 1)}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// Remaining setup tasks once the first-run onboarding checklist is complete.
function nextSteps(setup: OrgOverview["setup"], canManage: boolean, isOwner: boolean) {
  const steps: { icon: typeof Plus; text: string; href: string; cta: string }[] = [];
  if (setup.missing_artwork_slug)
    steps.push({ icon: ImageIcon, text: "Add artwork to finish setting up your show.", href: `/dashboard/podcasts/${setup.missing_artwork_slug}/edit`, cta: "Add artwork" });
  if (setup.unsubmitted_slug)
    steps.push({ icon: Link2, text: "Submit your podcast to Apple Podcasts, then add your listen links.", href: `/dashboard/podcasts/${setup.unsubmitted_slug}/edit`, cta: "Add links" });
  if (!setup.has_teammate && canManage)
    steps.push({ icon: UserPlus, text: "Invite a teammate to help produce your show.", href: "/dashboard/settings/members", cta: "Invite" });
  if (setup.at_publish_limit && isOwner)
    steps.push({ icon: Zap, text: "Upgrade to publish more episodes this month.", href: "/dashboard/settings/billing", cta: "View plans" });
  return steps;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, currentOrg } = useAuthStore();
  const { isStaff, canEdit, canManage } = useRole();

  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const { data: overview } = useQuery({
    queryKey: ["overview", currentOrg?.slug],
    queryFn:  () => organizationsApi.overview(currentOrg!.slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  const published      = podcasts.filter((p) => p.published);
  const hasPublished   = published.length > 0;
  const firstPublished = published[0];

  // Onboarding state: show checklist until org has at least one published podcast
  const showOnboarding = !isStaff && !isLoading && !hasPublished;
  // Directory banner: show after first publish, until dismissed
  const showDirectory  = !isStaff && !isLoading && hasPublished && !!firstPublished;
  const steps = overview && hasPublished ? nextSteps(overview.setup, canManage, currentOrg?.role === "owner") : [];

  const stats = [
    { label: "Podcasts",           value: overview?.stats.podcasts ?? podcasts.length },
    { label: "Published episodes", value: overview?.stats.published_episodes ?? "—" },
    { label: "Draft episodes",     value: overview?.stats.draft_episodes ?? "—" },
    { label: "Storage used",       value: overview ? formatBytes(overview.stats.storage_used_bytes) : "—",
      sub: overview ? `of ${formatBytes(overview.stats.storage_limit_bytes)}` : undefined },
    { label: "Plan",               value: currentOrg ? PLAN_CATALOGUE[currentOrg.plan].label : "—",
      href: currentOrg?.role === "owner" ? "/dashboard/settings/billing" : undefined },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 engraving-bg py-6 border-b border-ink-800">
        <h1 className="font-display text-2xl text-ink-100 mb-1">Welcome back, {user?.first_name}.</h1>
        <p className="text-sm text-ink-500">Manage your podcasts, publishing workflow, and team access from one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink-800 mb-8 border border-ink-800">
        {stats.map(({ label, value, sub, href }) => {
          const body = (
            <>
              <p className="text-[9px] uppercase tracking-widest text-ink-600 font-bold mb-1">{label}</p>
              <p className="text-2xl font-bold text-ink-100">{value}</p>
              {sub && <p className="text-[10px] text-ink-600">{sub}</p>}
            </>
          );
          return href ? (
            <Link key={label} href={href} className="bg-ink-950 px-5 py-4 hover:bg-ink-900 transition-colors">{body}</Link>
          ) : (
            <div key={label} className="bg-ink-950 px-5 py-4">{body}</div>
          );
        })}
      </div>

      {/* Onboarding checklist — shown until first podcast is published */}
      {showOnboarding && <OnboardingChecklist podcasts={podcasts} />}

      {/* Directory submission banner — shown after first publish */}
      {showDirectory && (
        <DirectorySubmissionBanner
          rssUrl={firstPublished.rss_url}
          orgSlug={currentOrg?.slug ?? ""}
        />
      )}

      <div className="grid md:grid-cols-[1fr_18rem] gap-6 mb-10">
        {/* Next steps */}
        {steps.length > 0 && (
          <div className="glass rounded-2xl p-5 md:col-start-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Next steps</h2>
            <ul className="divide-y divide-ink-800">
              {steps.map(({ icon: Icon, text, href, cta }) => (
                <li key={text} className="flex items-center gap-3 py-2.5">
                  <Icon className="h-4 w-4 text-accent shrink-0" />
                  <span className="flex-1 text-sm text-ink-300">{text}</span>
                  <Link href={href} className="text-[11px] font-bold uppercase tracking-widest text-ink-400 hover:text-ink-100 shrink-0">
                    {cta} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent activity */}
        {overview && overview.activity.length > 0 && (
          <div className={`glass rounded-2xl p-5 ${steps.length > 0 ? "md:col-start-2 md:row-start-1" : "md:col-span-2"}`}>
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">
              <Activity className="h-3.5 w-3.5" /> Recent activity
            </h2>
            <ul className="space-y-2.5">
              {overview.activity.map((a, i) => (
                <li key={`${a.kind}-${a.at}-${i}`} className="text-xs">
                  <p className="text-ink-300 truncate">
                    {a.podcast_slug ? (
                      <Link href={a.episode_id ? `/dashboard/podcasts/${a.podcast_slug}/episodes/${a.episode_id}/edit` : `/dashboard/podcasts/${a.podcast_slug}`}
                        className="hover:text-ink-100">{a.text}</Link>
                    ) : a.text}
                  </p>
                  <p className="text-[10px] text-ink-600">{relativeTime(a.at)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Podcasts */}
      <div className="mb-6 flex items-center justify-between">
        <div className="ornament-divider flex-1">
          <span>Your podcasts</span>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => router.push("/dashboard/podcasts/new")} className="ml-4 shrink-0">
            <Plus className="h-3 w-3" /> New podcast
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-px">
          {[1,2,3].map((i) => <div key={i} className="h-16 shimmer-bg" />)}
        </div>
      ) : podcasts.length === 0 ? (
        <EmptyState
          icon={Mic2}
          title="You're one step away from publishing."
          body="Create your show, upload audio, and publish from one clean dashboard."
          primary={canEdit && <Button onClick={() => router.push("/dashboard/podcasts/new")}><Plus className="h-3.5 w-3.5" /> Create your first podcast</Button>}
          secondary={canEdit && <Button variant="secondary" onClick={() => router.push("/dashboard/podcasts/new?mode=import")}><Download className="h-3.5 w-3.5" /> Import an existing show</Button>}
        />
      ) : (
        <div className="space-y-px border border-ink-800">
          {podcasts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 bg-ink-950 hover:bg-ink-900 transition-colors group border-l-2 border-transparent hover:border-accent">
              {p.artwork_url ? (
                <img src={p.artwork_url} alt="" className="h-10 w-10 object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 border border-ink-800 flex items-center justify-center shrink-0">
                  <Mic2 className="h-4 w-4 text-ink-600" />
                </div>
              )}
              <Link href={`/dashboard/podcasts/${p.slug}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-ink-200 group-hover:text-ink-100 transition-colors truncate">{p.title}</p>
                  <Badge variant={p.published ? "live" : "default"}>{p.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="text-[11px] text-ink-600">
                  {p.episode_count ?? 0} episode{p.episode_count === 1 ? "" : "s"} · Updated {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                {canEdit && (
                  <Link href={`/dashboard/podcasts/${p.slug}/episodes/new`}
                    className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-ink-500 hover:text-ink-100">
                    Add episode
                  </Link>
                )}
                <Link href={`/dashboard/podcasts/${p.slug}`} aria-label={`Manage ${p.title}`}>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-700 group-hover:text-accent transition-colors" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
