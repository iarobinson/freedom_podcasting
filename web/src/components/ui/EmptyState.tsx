import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  compact?: boolean;
}

// Shared empty-state pattern: icon, headline, supporting line, primary + optional secondary CTA.
export function EmptyState({ icon: Icon, title, body, primary, secondary, compact }: EmptyStateProps) {
  return (
    <div className={compact ? "py-12 px-6 text-center" : "glass rounded-2xl p-16 text-center"}>
      <div className="h-12 w-12 bg-ink-800 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-ink-500" />
      </div>
      <h3 className="font-display text-xl text-ink-200 mb-2">{title}</h3>
      <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">{body}</p>
      {(primary || secondary) && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {primary}
          {secondary}
        </div>
      )}
    </div>
  );
}
