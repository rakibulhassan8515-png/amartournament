import React, { createContext, useContext, useState, useCallback } from "react";
// @ts-ignore
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" | "warning") => {
    const id = "toast-" + Math.floor(Math.random() * 1000000);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast container in top-right corner */}
      <div 
        document-attr="toast-container"
        id="toast-notifications-container"
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            return (
              <motion.div
                key={toast.id}
                id={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-150 ${
                  isSuccess
                    ? "bg-[#0D241D]/95 border-emerald-500/30 text-emerald-300"
                    : isError
                    ? "bg-[#271017]/95 border-rose-500/30 text-rose-300"
                    : isWarning
                    ? "bg-[#251B0E]/95 border-amber-500/30 text-amber-300"
                    : "bg-[#111827]/95 border-zinc-750 text-zinc-300"
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 mt-0.5 animate-pulse">
                  {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {isError && <AlertOctagon className="w-5 h-5 text-rose-400" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-400" />}
                </div>

                {/* Message */}
                <div className="flex-grow">
                  <p className="text-xs sm:text-sm font-semibold select-none">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-zinc-400 hover:text-white p-0.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
