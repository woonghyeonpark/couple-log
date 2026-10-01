import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-background px-3 text-base placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
