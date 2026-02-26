import { create } from "zustand";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; title: string; description?: string; }

interface ToastStore {
  toasts: Toast[];
  add: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add:    (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().add({ type: "success", title, description }),
  error:   (title: string, description?: string) => useToastStore.getState().add({ type: "error",   title, description }),
  info:    (title: string, description?: string) => useToastStore.getState().add({ type: "info",    title, description }),
};
