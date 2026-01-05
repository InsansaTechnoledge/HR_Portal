import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from '../../lib/utils';

const ErrorToast = ({ error, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsLeaving(false);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "z-100 fixed bottom-5 right-5 flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl",
        "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground",
        "border border-destructive/20 backdrop-blur-sm",
        "transform transition-all duration-300 ease-out",
        isLeaving
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100 animate-slide-in-right"
      )}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        <div className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold tracking-wide uppercase opacity-90">
          Error
        </h3>
        <p className="text-sm opacity-90 mt-0.5 line-clamp-2">
          {error || "An error occurred. Please try again."}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-full"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ErrorToast;
