import { useEffect, useState } from 'react';
import { dismissToast, subscribeToasts } from '../services/toastService';
import type { Toast } from '../services/toastService';
import './ToastContainer.css';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <span className="toast__message">{toast.message}</span>
          <button type="button" className="toast__dismiss" aria-label="Dismiss" onClick={() => dismissToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
