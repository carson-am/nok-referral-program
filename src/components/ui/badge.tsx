import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border/70 px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/25",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
        warning: "bg-amber-500/15 text-amber-200 border-amber-500/25",
        muted: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/15 text-destructive border-destructive/25",
        info: "bg-primary/15 text-primary border-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

