"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Pause, Loader2 } from "lucide-react";

export interface Chapter {
  timeSeconds: number;
  label: string;
}

export interface WaveformPlayerProps {
  src: string;
  type?: string;
  durationSecs?: number;
  peaks?: number[];
  chapters?: Chapter[];
}

/** Parse [M:SS] timestamp lines from a Whisper transcript */
export function parseChapters(transcript: string): Chapter[] {
  return transcript
    .split("\n")
    .map((line) => line.match(/^\[(\d+):(\d{2})\]\s*(.*)/))
    .filter(Boolean)
    .map((m) => ({
      timeSeconds: parseInt(m![1]) * 60 + parseInt(m![2]),
      label: m![3].trim(),
    }))
    .filter((c) => c.label.length > 0);
}

function fmt(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function WaveformPlayer({
  src,
  type = "audio/mpeg",
  durationSecs,
  peaks = [],
  chapters = [],
}: WaveformPlayerProps) {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const [duration, setDuration] = useState(durationSecs ?? 0);
  const [tooltip, setTooltip]   = useState<{ x: number; label: string } | null>(null);

  // Keep duration in sync if the prop arrives after mount (SSR → hydration)
  useEffect(() => {
    if (durationSecs && !duration) setDuration(durationSecs);
  }, [durationSecs]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
  }, [playing]);

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  const handleWaveformClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const a = audioRef.current;
    if (a && duration > 0) a.currentTime = ratio * duration;
  };

  // Number of bars to render
  const BAR_COUNT  = peaks.length || 0;
  const BAR_WIDTH  = BAR_COUNT > 0 ? 100 / BAR_COUNT : 0;
  const BAR_GAP    = 0.4; // fraction of bar width used as gap

  return (
    <div className="w-full space-y-2">
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

      {/* Waveform SVG */}
      {BAR_COUNT > 0 ? (
        <div className="relative w-full">
          <svg
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            className="w-full h-14 cursor-pointer select-none"
            onClick={handleWaveformClick}
          >
            {peaks.map((peak, i) => {
              const x     = i * BAR_WIDTH + BAR_GAP / 2;
              const w     = BAR_WIDTH - BAR_GAP;
              const h     = Math.max(peak * 20, 1);
              const y     = 12 - h / 2;
              const barPct = ((i + 0.5) / BAR_COUNT) * 100;
              const played = barPct <= pct;
              return (
                <rect
                  key={i}
                  x={x} y={y} width={w} height={h}
                  rx={0.3}
                  fill={played ? "var(--accent)" : "rgba(255,255,255,0.10)"}
                />
              );
            })}

            {/* Chapter marker lines */}
            {chapters.map((ch, i) => {
              if (!duration) return null;
              const x = (ch.timeSeconds / duration) * 100;
              return (
                <line
                  key={i}
                  x1={x} y1={0} x2={x} y2={24}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={0.5}
                  strokeDasharray="1.5 1"
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.closest("svg") as SVGElement).getBoundingClientRect();
                    setTooltip({ x: (x / 100) * rect.width, label: ch.label });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: "default" }}
                />
              );
            })}
          </svg>

          {/* Chapter tooltip */}
          {tooltip && (
            <div
              className="absolute -top-7 text-[10px] px-2 py-0.5 rounded-sm bg-ink-800 border border-ink-700 text-ink-300 whitespace-nowrap pointer-events-none"
              style={{ left: tooltip.x, transform: "translateX(-50%)" }}>
              {tooltip.label}
            </div>
          )}
        </div>
      ) : (
        /* Fallback scrubber when no peaks data */
        <div className="relative flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%`, background: "var(--accent)" }}
          />
          <input
            type="range" min={0} max={duration || 100} step={0.1} value={current}
            onChange={(e) => { const a = audioRef.current; if (a) a.currentTime = Number(e.target.value); }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(188,66,58,0.15)" }}>
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--accent)" }} />
            : playing
              ? <Pause className="h-4 w-4" style={{ color: "var(--accent)" }} />
              : <Play  className="h-4 w-4 ml-0.5" style={{ color: "var(--accent)" }} />}
        </button>
        <span className="text-xs tabular-nums" style={{ color: "#6b6760" }}>
          {fmt(current)}
        </span>
        <span className="text-xs tabular-nums ml-auto" style={{ color: "#6b6760" }}>
          {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
