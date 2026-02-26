"use client";
import { useCallback, useState } from "react";
import { Upload, Loader2, CheckCircle2, XCircle, Music2 } from "lucide-react";
import { clsx } from "clsx";
import { uploadsApi } from "@/lib/api";
import type { PresignedUploadResponse } from "@/types";

interface Props {
  orgSlug: string;
  podcastSlug: string;
  episodeId?: number;
  onUploadComplete: (data: { mediaFileId: number; publicUrl: string }) => void;
  onError?: (error: string) => void;
}

type State = "idle" | "uploading" | "processing" | "complete" | "error";

const ACCEPTED = ["audio/mpeg","audio/mp4","audio/ogg","audio/wav","audio/x-wav","audio/flac"];
const MAX_BYTES = 500 * 1024 * 1024;

export function AudioUploader({ orgSlug, podcastSlug, episodeId, onUploadComplete, onError }: Props) {
  const [state,    setState]    = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [isDrag,   setIsDrag]   = useState(false);
  const [errMsg,   setErrMsg]   = useState("");

  const handle = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      const msg = `Unsupported type: ${file.type}`;
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }
    if (file.size > MAX_BYTES) {
      const msg = "File too large (max 500MB)";
      setErrMsg(msg); setState("error"); onError?.(msg); return;
    }
    setFileName(file.name); setState("uploading"); setProgress(0);
    try {
      const presignRes = await uploadsApi.presign(orgSlug, podcastSlug, { filename: file.name, content_type: file.type, upload_type: "audio" });
      const presign: PresignedUploadResponse = presignRes.data.data;
      await uploadsApi.uploadToR2(presign.presigned_url, file, setProgress);
      setState("processing");
      const completeRes = await uploadsApi.complete(orgSlug, podcastSlug, { media_file_id: presign.media_file_id, episode_id: episodeId, file_size: file.size });
      setState("complete");
      onUploadComplete({ mediaFileId: completeRes.data.data.media_file_id, publicUrl: completeRes.data.data.public_url });
    } catch {
      const msg = "Upload failed — please try again";
      setErrMsg(msg); setState("error"); onError?.(msg);
    }
  }, [orgSlug, podcastSlug, episodeId, onUploadComplete, onError]);

  const reset = () => { setState("idle"); setProgress(0); setFileName(""); setErrMsg(""); };

  return (
    <div className="w-full">
      {state === "idle" && (
        <label
          className={clsx("flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
            isDrag ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-brand-500/40 hover:bg-white/3")}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}>
          <input type="file" className="hidden" accept={ACCEPTED.join(",")} onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15">
              <Upload className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-300">Drop audio here or <span className="text-brand-400">browse</span></p>
              <p className="text-xs text-ink-600 mt-0.5">MP3, MP4, OGG, WAV, FLAC · max 500MB</p>
            </div>
          </div>
        </label>
      )}

      {(state === "uploading" || state === "processing") && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 shrink-0">
              <Music2 className="h-5 w-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-200 truncate">{fileName}</p>
              <p className="text-xs text-ink-500 mt-0.5">{state === "uploading" ? `Uploading ${progress}%` : "Processing…"}</p>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: state === "uploading" ? `${progress}%` : "100%" }} />
              </div>
            </div>
            {state === "processing" && <Loader2 className="h-4 w-4 animate-spin text-brand-400 shrink-0" />}
          </div>
        </div>
      )}

      {state === "complete" && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-300">Upload complete</p>
            <p className="text-xs text-emerald-500 truncate mt-0.5">{fileName}</p>
          </div>
          <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-400 transition-colors">Replace</button>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Upload failed</p>
            <p className="text-xs text-red-500 mt-0.5">{errMsg}</p>
          </div>
          <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-400 transition-colors shrink-0">Retry</button>
        </div>
      )}
    </div>
  );
}
