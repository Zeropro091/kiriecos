import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-kiri-green-900/95 text-white border-kiri-green-600'
              : toast.type === 'warning'
              ? 'bg-amber-900/95 text-white border-amber-600'
              : 'bg-kiri-ivory-warm text-kiri-dark-900 border-kiri-gold-500/30'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-kiri-gold-400 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-kiri-green-600 shrink-0 mt-0.5" />}
          <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
