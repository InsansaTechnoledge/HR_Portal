import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

/* ---------------------------------- */
/* Viewport                            */
/* ---------------------------------- */
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-3 p-4",
      "sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/* ---------------------------------- */
/* Variants                            */
/* ---------------------------------- */
const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden",
    "rounded-2xl border p-4 pr-10",
    "bg-background/80 backdrop-blur-xl",
    "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]",
    "transition-all duration-300 ease-out",
    "data-[state=open]:animate-[toast-slide-in_0.35s_cubic-bezier(0.22,1,0.36,1)]",
    "data-[state=closed]:animate-[toast-slide-out-right_0.25s_ease-in]",

  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-border/40",
        success:
          "border-emerald-500/30",
        destructive:
          "border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* ---------------------------------- */
/* Root                                */
/* ---------------------------------- */
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    {/* Accent strip */}
    <div
      className={cn(
        "absolute left-0 top-0 h-full w-1.5 rounded-l-2xl",
        variant === "success" &&
          "bg-gradient-to-b from-emerald-400 to-emerald-600",
        variant === "destructive" &&
          "bg-gradient-to-b from-red-400 to-red-600",
        variant === "default" &&
          "bg-gradient-to-b from-primary to-primary/70"
      )}
    />
    {props.children}
  </ToastPrimitives.Root>
));
Toast.displayName = ToastPrimitives.Root.displayName;

/* ---------------------------------- */
/* Title                               */
/* ---------------------------------- */
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/* ---------------------------------- */
/* Description                         */
/* ---------------------------------- */
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground leading-snug",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName =
  ToastPrimitives.Description.displayName;

/* ---------------------------------- */
/* Action                              */
/* ---------------------------------- */
const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium",
      "bg-background hover:bg-muted transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/* ---------------------------------- */
/* Close                               */
/* ---------------------------------- */
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-md p-1",
      "text-muted-foreground hover:text-foreground",
      "hover:bg-muted transition",
      "focus:outline-none focus:ring-2 focus:ring-ring"
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/* ---------------------------------- */
/* Animations                          */
/* ---------------------------------- */
const styles = `
@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-slide-out-right {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(120%) scale(0.98);
  }
}
`;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

/* Inject animations once */
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = styles;
  document.head.appendChild(style);
}
