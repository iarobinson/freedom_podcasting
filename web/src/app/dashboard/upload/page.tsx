"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Upload, ArrowRight, Mic2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { podcastsApi } from "@/lib/api";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { toast } from "@/lib/toast";
import type { Podcast } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [selectedPodcast, setSelectedPodcast] = useState<string>("");
  const [uploaded, setUploaded] = useState(false);

  const { data: podcasts = [] } = useQuery<Podcast[]>({
    queryKey: ["podcasts", currentOrg?.slug],
    queryFn:  () => podcastsApi.list(currentOrg!.slug).then((r) => r.data.data),
    enabled:  !!currentOrg,
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-100 mb-1">Upload Audio</h1>
        <p className="text-sm text-ink-500">Upload an audio file to attach to an episode</p>
      </div>

      {podcasts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Mic2 className="h-10 w-10 text-ink-700 mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink-300 mb-2">No podcasts yet</h3>
          <p className="text-sm text-ink-500 mb-6">Create a podcast first, then upload episodes.</p>
          <button
            onClick={() => router.push("/dashboard/podcasts/new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            <Mic2 className="h-4 w-4" /> Create Podcast
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Select Podcast</h2>
            <div className="grid gap-2">
              {podcasts.map((p) => (
                <button key={p.id} onClick={() => setSelectedPodcast(p.slug)}
                  className={`flex items-center gap-3 w-full rounded-xl p-3 text-left transition-all ${
                    selectedPodcast === p.slug
                      ? "bg-brand-500/15 border border-brand-500/30"
                      : "bg-white/3 border border-white/8 hover:bg-white/6"
                  }`}>
                  {p.artwork_url ? (
                    <img src={p.artwork_url} alt={p.title} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                      <Mic2 className="h-5 w-5 text-brand-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink-200">{p.title}</p>
                    <p className="text-xs text-ink-600">{p.episode_count} episodes</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPodcast && currentOrg && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-brand-400" />
                <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
              </div>
              <AudioUploader
                orgSlug={currentOrg.slug}
                podcastSlug={selectedPodcast}
                onUploadComplete={() => {
                  setUploaded(true);
                  toast.success("Audio uploaded!", "Now create an episode to attach it.");
                }}
                onError={(err) => toast.error("Upload failed", err)}
              />
              {uploaded && (
                <button
                  onClick={() => router.push(`/dashboard/podcasts/${selectedPodcast}/episodes/new`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
                  Create Episode <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
