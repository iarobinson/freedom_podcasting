"use client";
import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { episodesApi } from "@/lib/api";
import { AudioUploader } from "@/components/upload/AudioUploader";
import { toast } from "@/lib/toast";

export default function NewEpisodePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { currentOrg } = useAuthStore();
  const [episodeId, setEpisodeId] = useState<number | null>(null);

  const handleFileSelected = useCallback(async () => {
    if (!currentOrg) return undefined;
    try {
      const res = await episodesApi.create(currentOrg.slug, slug, { episode_type: "full" });
      const id: number = res.data.data.id;
      setEpisodeId(id);
      return id;
    } catch {
      toast.error("Could not create episode", "Please try again.");
      return undefined;
    }
  }, [currentOrg, slug]);

  const handleUploadComplete = useCallback(() => {
    router.push(`/dashboard/podcasts/${slug}`);
  }, [router, slug]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to podcast
      </button>

      <h1 className="font-display text-2xl text-ink-100 mb-1">New Episode</h1>
      <p className="text-sm text-ink-500 mb-8">Upload your audio file to get started</p>

      <div className="panel rounded-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Audio File</h2>
        </div>
        <p className="text-sm text-ink-500">
          Drop your audio file below. AI will automatically generate the title, description, and show notes from the transcript.
        </p>
        {currentOrg && (
          <AudioUploader
            orgSlug={currentOrg.slug}
            podcastSlug={slug}
            onFileSelected={handleFileSelected}
            onUploadComplete={handleUploadComplete}
            onError={(err) => toast.error("Upload failed", err)}
          />
        )}
      </div>
    </div>
  );
}
