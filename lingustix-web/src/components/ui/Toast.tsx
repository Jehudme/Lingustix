'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/15 shadow-emerald-500/10',
  error: 'border-red-500/40 bg-red-500/15 shadow-red-500/10',
  info: 'border-blue-500/40 bg-blue-500/15 shadow-blue-500/10',
  warning: 'border-amber-500/40 bg-amber-500/15 shadow-amber-500/10',
};

const toastTitles: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
};

const titleColors: Record<ToastType, string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className={`
                flex items-start gap-3 px-4 py-4 rounded-xl border backdrop-blur-md
                min-w-[320px] max-w-[420px] shadow-xl pointer-events-auto
                ${toastStyles[toast.type]}
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {toastIcons[toast.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${titleColors[toast.type]}`}>
                  {toastTitles[toast.type]}
                </p>
                <p className="text-sm text-slate-200 mt-0.5 break-words leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors group"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
