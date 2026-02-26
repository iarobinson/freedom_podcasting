"use client";
import { useToastStore } from "@/lib/toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: { id: string; type: string; title: string; description?: string }; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    error:   <AlertCircle  className="h-4 w-4 text-red-400 shrink-0" />,
    info:    <Info         className="h-4 w-4 text-brand-400 shrink-0" />,
  } as Record<string, React.ReactNode>;

  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-up shadow-xl">
      <div className="mt-0.5">{icons[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-100">{t.title}</p>
        {t.description && <p className="text-xs text-ink-400 mt-0.5">{t.description}</p>}
      </div>
      <button onClick={onRemove} className="text-ink-500 hover:text-ink-300 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
