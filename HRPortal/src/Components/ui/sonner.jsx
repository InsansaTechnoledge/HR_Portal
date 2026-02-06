import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, toast } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme} // fixed syntax
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]-background group-[.toaster]-foreground group-[.toaster]-border group-[.toaster]-lg",
          description: "group-[.toast]-muted-foreground",
          actionButton: "group-[.toast]-primary group-[.toast]-primary-foreground",
          cancelButton: "group-[.toast]-muted group-[.toast]-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
