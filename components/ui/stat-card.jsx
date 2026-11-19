import * as React from "react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs transition-colors space-y-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {value}
      </div>

      {hint && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
          {hint}
        </div>
      )}
    </div>
  )
}

export default StatCard

