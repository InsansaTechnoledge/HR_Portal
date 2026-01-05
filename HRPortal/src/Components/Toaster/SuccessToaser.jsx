import React, { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "../../lib/utils";

const SuccessToast = ({ message, duration = 3500, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) return;

    setVisible(true);
    setLeaving(false);

    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  const close = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-[100] w-[360px]",
        "rounded-2xl p-[1px]",
        "bg-gradient-to-br from-emerald-400/60 via-emerald-300/40 to-teal-400/60",
        "shadow-[0_20px_40px_-15px_rgba(16,185,129,0.6)]",
        leaving
          ? "translate-x-6 opacity-0 scale-95"
          : "translate-x-0 opacity-100 scale-100",
        "transition-all duration-300 ease-out"
      )}
    >
      {/* Glass container */}
      <div className="relative rounded-2xl bg-background/80 backdrop-blur-xl px-4 py-3">
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Success
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground leading-snug">
              {message || "Operation completed successfully."}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Close notification"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-emerald-500"
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SuccessToast;
