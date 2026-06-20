export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

type ToastListener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: ToastListener[] = [];

function emit(): void {
  listeners.forEach((listener) => listener(toasts));
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.push(listener);
  listener(toasts);
  return () => {
    listeners = listeners.filter((existing) => existing !== listener);
  };
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showToast(message: string, tone: ToastTone = 'info', durationMs = 5000): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => dismissToast(id), durationMs);
}
