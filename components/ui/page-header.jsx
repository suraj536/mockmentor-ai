import * as React from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className,
  ...props
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40 mb-6",
        className
      )}
      {...props}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[24px] leading-[30px] sm:text-[28px] sm:leading-[34px] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
          {children}
        </div>
      )}
    </header>
  )
}

export default PageHeader

