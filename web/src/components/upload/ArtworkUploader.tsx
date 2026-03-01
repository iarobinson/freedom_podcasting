"use client";
import { useCallback, useState } from "react";
import { Upload, Loader2, XCircle, ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { uploadsApi } from "@/lib/api";

interface Props {
  orgSlug: string;
  podcastSlug: string;
  currentUrl?: string | null;
  onUploadComplete: (publicUrl: string) => void;
  onError?: (error: string) => void;
}

type State = "idle" | "uploading" | "processing" | "complete" | "error";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export function ArtworkUploader({ orgSlug, podcastSlug, currentUrl, onUploadComplete, onError }: Props) {
  const [state,    setState]    = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [isDrag,   setIsDrag]   = useState(false);
  const [errMsg,   setErrMsg]   = useState("");

  const handle = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      const msg = "Please upload a JPEG, PNG, or WebP image";
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }
    if (file.size > MAX_BYTES) {
      const msg = "Image too large (max 10MB)";
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setState("uploading");
    setProgress(0);

    try {
      const presignRes = await uploadsApi.presign(orgSlug, podcastSlug, {
        filename: file.name,
        content_type: file.type,
        upload_type: "artwork",
      });
      const presign = presignRes.data.data;
      await uploadsApi.uploadToR2(presign.presigned_url, file, setProgress);
      setState("processing");
      const completeRes = await uploadsApi.complete(orgSlug, podcastSlug, {
        media_file_id: presign.media_file_id,
        file_size: file.size,
      });
      setState("complete");
      onUploadComplete(completeRes.data.data.public_url);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      const msg = "Upload failed — please try again";
      setErrMsg(msg); setState("error"); onError?.(msg);
    }
  }, [orgSlug, podcastSlug, onUploadComplete, onError]);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setState("idle"); setProgress(0); setPreview(null); setErrMsg("");
  };

  const displayUrl = preview ?? currentUrl;
  const isActive = state === "uploading" || state === "processing";

  return (
    <div className="flex items-start gap-5">
      {/* Artwork preview */}
      <div className="relative shrink-0">
        <div className={clsx(
          "w-28 h-28 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center",
          isActive && "opacity-60"
        )}>
          {displayUrl ? (
            <img src={displayUrl} alt="Podcast artwork" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-ink-600" />
          )}
        </div>
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          </div>
        )}
      </div>

      {/* Upload control */}
      <div className="flex-1 min-w-0">
        {state === "error" ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-3 flex items-start gap-3">
            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-300">Upload failed</p>
              <p className="text-xs text-red-500 mt-0.5">{errMsg}</p>
            </div>
            <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-400 transition-colors shrink-0">Retry</button>
          </div>
        ) : (
          <label
            className={clsx(
              "flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              isActive && "pointer-events-none opacity-50",
              isDrag ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-brand-500/40 hover:bg-white/3"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}>
            <input
              type="file"
              className="hidden"
              accept={ACCEPTED.join(",")}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
            />
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15">
                <Upload className="h-4 w-4 text-brand-400" />
              </div>
              {isActive ? (
                <p className="text-xs text-ink-500">
                  {state === "uploading" ? `Uploading ${progress}%` : "Processing…"}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-ink-300">
                    {currentUrl || preview ? "Replace artwork" : "Upload artwork"}
                  </p>
                  <p className="text-xs text-ink-600">JPEG, PNG, WebP · min 1400×1400 · max 10MB</p>
                </>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
