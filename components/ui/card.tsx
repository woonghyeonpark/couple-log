import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-border bg-background p-4 shadow-sm", className)} {...props} />;
}

export { Card };
