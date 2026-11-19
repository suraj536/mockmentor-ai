import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/15 text-primary-text hover:bg-primary/25",
        secondary:
          "border-border/40 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "border-success/20 bg-success/15 text-success-text hover:bg-success/25",
        warning:
          "border-warning/20 bg-warning/15 text-warning-text hover:bg-warning/25",
        destructive:
          "border-destructive/20 bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline:
          "border-border text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

