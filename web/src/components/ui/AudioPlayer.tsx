"use client";
import { useRef, useState, useCallback } from "react";
import { Play, Pause, Loader2 } from "lucide-react";

interface Props {
  src: string;
  type?: string;
  durationSecs?: number;
}

function fmt(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function AudioPlayer({ src, type = "audio/mpeg", durationSecs }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const [duration, setDuration] = useState(durationSecs ?? 0);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
  }, [playing]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (a) a.currentTime = Number(e.target.value);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? durationSecs ?? 0)}
      />

      {/* Play / Pause */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(188,66,58,0.15)" }}>
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#bc423a" }} />
          : playing
            ? <Pause className="h-4 w-4" style={{ color: "#bc423a" }} />
            : <Play  className="h-4 w-4 ml-0.5" style={{ color: "#bc423a" }} />}
      </button>

      {/* Scrubber + times */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-xs tabular-nums w-10 text-right shrink-0" style={{ color: "#6b6760" }}>
          {fmt(current)}
        </span>

        <div className="relative flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%`, background: "#bc423a" }}
          />
          {/* Invisible range input for interaction */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={current}
            onChange={seek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>

        <span className="text-xs tabular-nums w-10 shrink-0" style={{ color: "#6b6760" }}>
          {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
